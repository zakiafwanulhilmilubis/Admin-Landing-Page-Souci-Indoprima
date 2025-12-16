"use client";

export default function Input({
  label,
  error,
  type = "text",
  required = false,
  className = "",
  name,
  id,
  autocomplete,
  ...props
}) {
  // Generate id from name if not provided
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 11)}`;
  
  // Determine autocomplete value based on type and name
  const getAutocomplete = () => {
    if (autocomplete !== undefined) return autocomplete;
    if (type === "email") return "email";
    if (type === "password") return "current-password";
    if (name === "email") return "email";
    if (name === "password") return "current-password";
    if (name === "username") return "username";
    return undefined;
  };

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        autoComplete={getAutocomplete()}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
