"use client";

import * as z from \"zod\";
import * as React from \"react\";
import { useForm } from \"react-hook-form\";
import { zodResolver } from \"@hookform/resolvers/zod\";

import { cn } from \"@/lib/utils\"

interface FormProps<T extends z.ZodType<any, any>> extends Omit<React.HTMLAttributes<HTMLFormElement>, \"onSubmit\"> {
  form: T
  onSubmit: (values: z.infer<T>) => Promise<void> | void
  children: React.ReactNode
  className?: string
}

function Form<T extends z.ZodType<any, any>>({ 
  form, 
  onSubmit, 
  children, 
  className, 
  ...props 
}: FormProps<T>) {
  const formInstance = useForm<z.infer<T>>({
    resolver: zodResolver(form),
    defaultValues: {},
  })

  function onSubmitHandler(values: z.infer<T>) {
    onSubmit(values)
  }

  return (
    <form
      onSubmit={formInstance.handleSubmit(onSubmitHandler)}
      className={cn(\"space-y-4\", className)}
      {...props}
    >
      {children}
    </form>
  )
}

export { Form }

