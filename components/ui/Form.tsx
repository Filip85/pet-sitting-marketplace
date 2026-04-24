import { FormHTMLAttributes } from 'react'

type FormProps = FormHTMLAttributes<HTMLFormElement>

export const Form = ({ children, ...props }: FormProps) => {
  return <form {...props}>{children}</form>
}