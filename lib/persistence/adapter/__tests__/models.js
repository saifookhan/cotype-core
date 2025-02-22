"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models = [
    {
        name: "news",
        singular: "News",
        fields: {
            title: { type: "string" },
            date: { type: "string", input: "date", index: true },
            image: { type: "media" },
            text: { type: "richtext" },
            inverseRef: {
                type: "references",
                model: "pages",
                fieldName: "optionalNews"
            }
        }
    },
    {
        name: "pages",
        singular: "Page",
        fields: {
            title: { type: "string" },
            news: { type: "content", models: ["news"], index: true, required: true },
            optionalNews: { type: "content", models: ["news"] },
            newsList: {
                type: "list",
                item: {
                    type: "content",
                    models: ["news"],
                    index: true
                }
            },
            stringList: {
                type: "list",
                item: {
                    type: "string",
                    index: true
                }
            }
        }
    },
    {
        name: "uniqueContent",
        singular: "Unique Content",
        uniqueFields: ["slug"],
        fields: {
            slug: { type: "string", input: "slug" }
        }
    },
    {
        name: "indexContent",
        singular: "Content with auto index",
        uniqueFields: ["slug"],
        fields: {
            name: {
                type: "string"
            },
            slug: { type: "string", input: "slug" },
            test: { type: "string" }
        }
    },
    {
        name: "positionContent",
        singular: "Content with position Field",
        orderBy: "posit",
        fields: {
            name: {
                type: "string"
            },
            posit: { type: "position" }
        }
    }
];
exports.default = models;
//# sourceMappingURL=models.js.map