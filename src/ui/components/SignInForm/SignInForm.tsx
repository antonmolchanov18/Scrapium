import { useForm } from "react-hook-form";

interface SignInFormProps {
  onSubmit: (data: any) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const handleSignIn = (data: any) => {
    onSubmit(data);
    reset(); // Скидаємо форму після відправки
  };

  return (
    <form onSubmit={handleSubmit(handleSignIn)}>
      <h1>Sign In</h1>
      <input
        type="text"
        placeholder="Name"
        {...register("signInName", { required: true })}
      />
      {errors.signInName && <p>Name is required</p>}
      <input
        type="password"
        placeholder="Password"
        {...register("signInPassword", { required: true })}
      />
      {errors.signInPassword && <p>Password is required</p>}
      <button type="submit">Sign In</button>
    </form>
  );
};

export default SignInForm;
