import { NavLink, useMatch } from 'react-router-dom';
import { ReactNode } from 'react';

interface SetActiveProps {
  isActive: boolean;
  isActiveClass: string;
  defaultClass: string;
}

const SetActive = ({ isActive, isActiveClass, defaultClass }: SetActiveProps): string =>
  isActive ? isActiveClass : defaultClass;

interface CustomLinkProps {
  children: ReactNode;
  to: string;
  isActiveClass?: string;
  defaultClass?: string;
}

export const CustomLink = ({
  children,
  to,
  isActiveClass = '',
  defaultClass = '',
}: CustomLinkProps) => {
  const match = useMatch(to);

  return (
    <NavLink
      to={to}
      className={() => SetActive({ isActive: !!match, isActiveClass, defaultClass })}
    >
      {children}
    </NavLink>
  );
};
