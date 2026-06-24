import { SVGProps } from "react";

export function XeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 90 40" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M 0 0 H 30 L 50 20 L 30 40 H 0 L 20 20 Z" />
      <path d="M 40 0 H 90 V 10 H 50 Z" />
      <path d="M 50 30 H 90 V 40 H 40 Z" />
      <path d="M 55 15 L 60 20 L 55 25 H 75 V 15 Z" />
    </svg>
  );
}
