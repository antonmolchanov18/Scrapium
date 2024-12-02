import { useState } from "react";
import SignUpForm from "../SignUpForm/SignUpForm";
import SignInForm from "../SignInForm/SignInForm";
import './Authorization.scss';

export const Authorization = () => {
  const [isActive, setIsActive] = useState(true);

  const onSubmitSignUp = () => {
    setIsActive(false);
  };

  const onSubmitSignIn = () => {
  };

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  return (
    <div className={`authorization authorization__container ${isActive ? "active" : ""}`} id="container">
      {/* Форма реєстрації */}
      <div className="authorization__form-container authorization__sign-up">
        {<SignUpForm onSubmit={onSubmitSignUp} />}
      </div>

      {/* Форма входу */}
      <div className="authorization__form-container authorization__sign-in">
        {<SignInForm onSubmit={onSubmitSignIn} />}
      </div>

      {/* Панель перемикання */}
      <div className="authorization__toggle-container">
        <div className="authorization__toggle">
          <div className="authorization__toggle-panel authorization__toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <button className="hidden" id="login" onClick={handleLoginClick}>
              Sign In
            </button>
          </div>
          <div className="authorization__toggle-panel authorization__toggle-right">
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details to use all of site features</p>
            <button className="hidden" id="register" onClick={handleRegisterClick}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
