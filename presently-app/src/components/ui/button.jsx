import React from "react";

/**
 * Button variants
 */
const variants = {
  default:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",

  outline:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-400",

  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400",

  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",

  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",

  link:
    "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500",
};

/**
 * Button sizes
 */
const sizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-6 text-base",
  xl: "h-12 px-8 text-base",
  icon: "h-10 w-10",
};

/**
 * Reusable Button component
 */
const Button = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      size = "default",
      type = "button",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg " +
      "font-medium whitespace-nowrap transition-all duration-200 " +
      "outline-none select-none " +
      "focus-visible:ring-2 focus-visible:ring-offset-2 " +
      "disabled:pointer-events-none disabled:opacity-50 " +
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 " +
      "[&_svg]:w-4 [&_svg]:h-4";

    const variantStyles = variants[variant] || variants.default;
    const sizeStyles = sizes[size] || sizes.default;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };