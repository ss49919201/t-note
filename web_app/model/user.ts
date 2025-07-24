import * as v from "valibot";

// User schema
export const UserSchema = v.object({
  id: v.number(),
  username: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  email: v.pipe(v.string(), v.email()),
  created_at: v.date(),
  updated_at: v.date(),
});

// User command schemas
export const CreateUserCommandSchema = v.object({
  username: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  email: v.pipe(v.string(), v.email()),
});

export const UpdateUserCommandSchema = v.object({
  id: v.number(),
  username: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(50))),
  email: v.optional(v.pipe(v.string(), v.email())),
});

// Type inference
export type User = v.InferOutput<typeof UserSchema>;
export type CreateUserCommand = v.InferOutput<typeof CreateUserCommandSchema>;
export type UpdateUserCommand = v.InferOutput<typeof UpdateUserCommandSchema>;