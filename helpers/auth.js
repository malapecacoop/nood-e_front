import { ref } from 'vue';

// Error messages mapping
const errorMessages = {
    required: 'Aquest camp és obligatori',
    email: "El format de l'email no és vàlid",
    minLength: 'Aquest camp ha de tenir almenys 9 caràcters',
    sameAsPassword: 'Les contrasenyes no coincideixen'
};

// Function to translate error messages based on validator ID
const translateError = (validator) => errorMessages[validator] || 'Error desconegut';

// Password visibility state
const passwordFieldType = ref('password');

// Function to toggle password visibility
const togglePasswordVisibility = () => {
    passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

// Export the functions and variables
export {
    translateError,
    passwordFieldType,
    togglePasswordVisibility,
};
