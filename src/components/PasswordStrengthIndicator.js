import React from 'react';

const PasswordStrengthIndicator = ({ password, validation }) => {
  if (!password || !validation) return null;

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Very Strong': return 'text-green-600 bg-green-100';
      case 'Strong': return 'text-blue-600 bg-blue-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Weak': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getStrengthWidth = (strength) => {
    switch (strength) {
      case 'Very Strong': return 'w-full';
      case 'Strong': return 'w-4/5';
      case 'Medium': return 'w-3/5';
      case 'Weak': return 'w-2/5';
      default: return 'w-1/5';
    }
  };

  return (
    <div className="mt-2">
      {/* Strength Indicator Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            validation.strength === 'Very Strong' ? 'bg-green-500' :
            validation.strength === 'Strong' ? 'bg-blue-500' :
            validation.strength === 'Medium' ? 'bg-yellow-500' :
            validation.strength === 'Weak' ? 'bg-orange-500' :
            'bg-red-500'
          } ${getStrengthWidth(validation.strength)}`}
        ></div>
      </div>

      {/* Strength Label */}
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(validation.strength)}`}>
        <span className="mr-1">
          {validation.strength === 'Very Strong' ? '🛡️' :
           validation.strength === 'Strong' ? '🔐' :
           validation.strength === 'Medium' ? '🔒' :
           validation.strength === 'Weak' ? '🔓' :
           '⚠️'}
        </span>
        Password Strength: {validation.strength}
      </div>

      {/* Feedback */}
      {validation.feedback.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <ul className="text-xs text-red-700 space-y-1">
            {validation.feedback.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security Tips */}
      {validation.isValid && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="text-xs text-green-700 flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            Your password meets security requirements!
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
