const { z } = require("zod");

const setSchema = z.object({
  type: z.string().min(1, "نوع ست الزامی است"),
  count: z.string().optional(),
  // setHash: z.string().min(1, "شناسه ست الزامی است"),
});

const movementSchema = z.object({
  action_title: z.string().min(1, "عنوان حرکت الزامی است"),
  // action_id: z.number().int("شناسه حرکت باید عدد صحیح باشد"),
  action_description: z.string().nullish(),
  // action_video_ur: z.string("آدرس ویدیو نامعتبر است").nullish(),
  action_pic_url: z.string("آدرس تصویر نامعتبر است").nullish(),
  description: z.string().optional(),
  sets: z.array(setSchema).min(1, "حداقل یک ست باید وجود داشته باشد"),
});

const exerciseSystemSchema = z.object({
  exercise_system: z.string().min(1, "نام سیستم تمرینی الزامی است"),
  // exercise_system_id: z.number().int("شناسه سیستم تمرینی باید عدد صحیح باشد"),
  movement_list: z.array(movementSchema).min(1, "لیست حرکات نباید خالی باشد"),
});

const daySchema = z.object({
  // id: z.number().int("شناسه روز باید عدد صحیح باشد"),
  // templateId: z.number().int("شناسه قالب باید عدد صحیح باشد"),
  data: z
    .array(exerciseSystemSchema)
    .min(1, "حداقل یک سیستم تمرینی باید وجود داشته باشد"),
  description: z.string().optional(),
  day_number: z.number().int("شماره روز باید عدد صحیح باشد"),
});

const programSchema = z.object({
  // id: z.number().int("شناسه برنامه باید عدد صحیح باشد"),
  title: z.string().min(1, "عنوان برنامه الزامی است").nullish(),
  // type: z.string().min(1, "نوع برنامه الزامی است"),
  // gender: z.string().min(1, "جنسیت الزامی است"),
  // location: z.string().min(1, "محل تمرین الزامی است"),
  // dayCount: z.number().int("تعداد روزها باید عدد صحیح باشد"),
  // target: z.string().min(1, "هدف برنامه الزامی است"),
  // injury: z.string().min(1, "وضعیت آسیب الزامی است"),
  // level: z.string().min(1, "سطح برنامه الزامی است"),
  // creatorId: z.number().nullable(),
  // created_at: z.string().datetime("فرمت تاریخ ایجاد نامعتبر است"),
  // updated_at: z.string().datetime("فرمت تاریخ بروزرسانی نامعتبر است"),
  days: z.array(daySchema).min(1, "حداقل یک روز باید تعریف شود"),
});

const requestBodySchema = z.object({
  couchName: z.string().nullish(),
  couchLogo: z.string().nullish(),
  program: programSchema,
});

module.exports.requestBodySchema = requestBodySchema;
