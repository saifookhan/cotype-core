import * as Cotype from "../../../typings";
import pick from "lodash/pick";
import visit from "../../model/visit";
import visitConvertedRestContent from "./visit";
import { Field } from "../../../typings";

const getModelsFromFieldType = (field: Field): string[] =>
  (("models" in field && field.models) ||
    ("model" in field && [field.model]) ||
    (field.type === "list" && "models" in field.item && field.item.models) ||
    (field.type === "list" && "model" in field.item && [field.item.model]) ||
    []) as string[];

// Converts Join with Dots to Array of Joins
// {news:['ref.slug']}=>[{news:['ref]},{product:['slug']}
export const getDeepJoins = (
  dp: Cotype.Join = {},
  models: Cotype.Model[]
): Cotype.Join[] => {
  const deeps: Cotype.Join = { ...dp };
  let deeperJoins = {};
  Object.entries(dp).forEach(([joinModel, fields]) => {
    const contentModel = models.find(
      m => m.name.toLowerCase() === joinModel.toLowerCase()
    );
    if (!contentModel) {
      return;
    }
    const deepJoinParser = (stringPath: string, field: Field) => {
      const fieldJoins = fields.filter(f => f.startsWith(stringPath));
      if (fieldJoins.length > 0) {
        fieldJoins.forEach(fieldJoin => {
          const [first, ...deepFields] = fieldJoin.split(".");
          if (deepFields.length >= 1) {
            const searchModels = getModelsFromFieldType(field);

            deeperJoins = searchModels.reduce<Cotype.Join>((acc, m) => {
              if (m) {
                if (acc[m]) {
                  acc[m] = [...acc[m], deepFields.join(".")];
                } else {
                  acc[m] = [deepFields.join(".")];
                }
              }
              return acc;
            }, deeperJoins);

            deeps[joinModel] = deeps[joinModel].filter(fl => fl !== fieldJoin);

            if (!deeps[joinModel].includes(first)) {
              deeps[joinModel].push(first);
            }
          }
        });
      }
    };
    visit({}, contentModel, {
      content(s, field, d, stringPath) {
        deepJoinParser(stringPath, field);
      },
      references(s: string, field, d, stringPath) {
        deepJoinParser(stringPath, field);
      },
      list(s: string, field, d, stringPath) {
        deepJoinParser(stringPath, field);
      }
    });
  });
  if (Object.keys(deeperJoins).length > 0) {
    return [deeps, ...getDeepJoins(deeperJoins, models)];
  }

  return [deeps];
};

// CreateJoin resolve WildCards in Join Models
export const createJoin = (join: Cotype.Join, models: Cotype.Model[]) => {
  // const joins = Object.keys(join || {});
  const filteredJoins: Cotype.Join = {};
  if (!join) return filteredJoins;

  // add wildcard possibility for model names
  Object.entries(join).forEach(([type, joins]) => {
    type = type.toLowerCase();

    if (type.startsWith("*")) {
      const modelPostfix = type.substring(1);
      models.forEach(m => {
        const modelName = m.name.toLowerCase();

        if (modelName.endsWith(modelPostfix)) {
          // keep all rules, dont overwrite

          filteredJoins[modelName] = filteredJoins[modelName]
            ? filteredJoins[modelName].concat(joins)
            : joins;
        }
      });
    } else {
      const model = models.find(m => m.name.toLowerCase() === type);
      if (model)
        filteredJoins[model.name] = filteredJoins[model.name]
          ? filteredJoins[model.name].concat(joins)
          : joins;
    }
  });
  return filteredJoins;
};

export const filterContentData = (
  content: Cotype.Content,
  join: Cotype.Join
) => {
  return {
    ...pick(content.data, join[content.type]),
    _id: String(content.id),
    _type: content.type
  };
};

export const getContainingMedia = (
  content: Cotype.Data,
  model: Cotype.Model,
  media: Cotype.MediaRefs
) => {
  const containingMedia: Cotype.MediaRefs = {};
  if (model && content) {
    visitConvertedRestContent(content, model, {
      media(m: { _id: string } | null) {
        if (!m) return;
        if (media[m._id]) containingMedia[m._id] = media[m._id];
      }
    });
  }
  return containingMedia;
};

export default function (
  contents: Cotype.Content[],
  refs: Cotype.Refs,
  join: Cotype.Join,
  models: Cotype.Model[]
): Cotype.Refs {
  const withDeepJoins = getDeepJoins(join, models).reduce(
    (acc, j) => ({ ...acc, ...j }),
    {}
  );
  const filteredJoin = createJoin(withDeepJoins, models);

  const content: any = {};
  const media: any = {};

  const getModel = (name: string) =>
    models.find(m => m.name.toLowerCase() === name.toLowerCase());

  // add all media files from the main contents
  contents.forEach(c => {
    Object.assign(
      media,
      getContainingMedia(c.data, getModel(c.type)!, refs.media)
    );
  });

  Object.keys(refs.content).forEach(type => {
    if (
      Object.keys(filteredJoin)
        .map(j => j.toLowerCase())
        .includes(type.toLowerCase())
    ) {
      content[type] = {};

      Object.entries(refs.content[type]).forEach(([key, value]) => {
        content[type][key] = filterContentData(value, filteredJoin);
        Object.assign(
          media,
          getContainingMedia(value.data, getModel(value.type)!, refs.media)
        );
      });
    }
  });

  return {
    content,
    media
  };
}
