const { z } = require("zod");

const FoodSchema = z.object({
  food_name: z.string(),
  food_image: z.string().nullable(),
  description: z.string(),
});

const MealSchema = z.object({
  meal_name: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  menu: z.array(FoodSchema),
});

const dietSchema = z.object({
  couchName: z.string().nullish(),
  couchLogo: z.string().nullish(),
  title: z.string(),
  type: z.string(),
  description: z.string(),
  gender: z.string(),
  target: z.string(),
  limitation: z.string(),
  calorie: z.number(),
  meals: z.array(MealSchema),
});

module.exports.dietSchema = dietSchema;
