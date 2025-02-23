const { z } = require("zod");

const setSchema = z.object({
  type: z.string().min(1, "نوع ست الزامی است"),
  count: z.string().optional(),
});

const movementSchema = z.object({
  action_title: z.string().min(1, "عنوان حرکت الزامی است"),
  action_description: z.string().nullish(),
  action_pic_url: z.string("آدرس تصویر نامعتبر است").nullish(),
  description: z.string().optional(),
  sets: z.array(setSchema).min(1, "حداقل یک ست باید وجود داشته باشد"),
});

const exerciseSystemSchema = z.object({
  exercise_system: z.string().min(1, "نام سیستم تمرینی الزامی است"),
  movement_list: z.array(movementSchema).min(1, "لیست حرکات نباید خالی باشد"),
});

const daySchema = z.object({
  data: z
    .array(exerciseSystemSchema)
    .min(1, "حداقل یک سیستم تمرینی باید وجود داشته باشد"),
  description: z.string().optional(),
  day_number: z.number().int("شماره روز باید عدد صحیح باشد"),
});

const programSchema = z.object({
  title: z.string().min(1, "عنوان برنامه الزامی است").nullish(),
  days: z.array(daySchema).min(1, "حداقل یک روز باید تعریف شود"),
});

const exerciseBodySchema = z.object({
  couchName: z.string().nullish(),
  couchLogo: z.string().nullish(),
  program: programSchema,
});

module.exports.exerciseBodySchema = exerciseBodySchema;
