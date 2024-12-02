import { useForm } from "react-hook-form";

interface SignUpFormProps {
  onSubmit: (data: any) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const handleSignUp = (data: any) => {
    onSubmit(data);
    reset(); // Скидаємо форму після відправки
  };

  return (
    <form onSubmit={handleSubmit(handleSignUp)}>
      <h1>Create Account</h1>
      <input
        type="text"
        placeholder="Name"
        {...register("signUpName", { required: true })}
      />
      {errors.signUpName && <p>Name is required</p>}
      <input
        type="password"
        placeholder="Password"
        {...register("signUpPassword", { required: true })}
      />
      {errors.signUpPassword && <p>Password is required</p>}
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUpForm;
