import joi from "joi";

const newPutsSchema = joi.object({
    date: joi.string().required(),
    description: joi.string().required(),
    value: joi.number().required(),
    status: joi.string().required(),
  });

  export const newPutsSchemaValidation = (req, res, next) => {
    const validation = newPutsSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }
  next()
}
