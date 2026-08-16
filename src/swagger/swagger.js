import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kendly API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Daxil olarkən aldığınız tokeni bura yapışdırın (Tokenin etibarlılıq müddəti 365 gündür)"
        },
      },
      schemas: {
        RatingStats: {
          type: "object",
          description: "Review summary for product/combo detail and review list pages",
          properties: {
            total_reviews: {
              type: "integer",
              example: 12,
              description: "Ümumi rəy sayı",
            },
            average_rating: {
              type: "number",
              example: 4.3,
              description: "Ortalama reytinq (1-5)",
            },
            rating_distribution: {
              type: "object",
              description: "Hər ulduz üçün rəy sayı",
              example: { "1": 0, "2": 1, "3": 2, "4": 4, "5": 5 },
            },
            rating_percentages: {
              type: "object",
              description: "Hər ulduz üçün faiz",
              example: { "1": 0, "2": 8.3, "3": 16.7, "4": 33.3, "5": 41.7 },
            },
          },
        },
        ReviewListResponse: {
          type: "object",
          properties: {
            reviews: {
              type: "array",
              items: { type: "object" },
            },
            rating_stats: {
              $ref: "#/components/schemas/RatingStats",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
};