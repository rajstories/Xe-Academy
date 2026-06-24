import { SVGProps } from "react";

export function XeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 140 60" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M 0 0 L 20 0 L 40 20 L 60 0 L 140 0 L 140 14 L 66 14 L 57 23 L 130 23 L 130 37 L 57 37 L 66 46 L 140 46 L 140 60 L 60 60 L 40 40 L 20 60 L 0 60 L 30 30 Z" />
    </svg>
  );
}
