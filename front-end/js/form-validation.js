// jQuery Form Validation Utility
// Comprehensive validation for all forms in the application

class FormValidator {
    constructor() {
        this.errorClass = 'is-invalid';
        this.successClass = 'is-valid';
        this.errorMessageClass = 'invalid-feedback';
    }

    // Initialize validation for all forms
    init() {
        this.initRegistrationValidation();
        this.initLoginValidation();
        this.initProductFormValidation();
        this.initProfileFormValidation();
    }

    // Show error message
    showError(element, message) {
        const $element = $(element);
        $element.removeClass(this.successClass).addClass(this.errorClass);
        
        // Remove existing error message
        $element.siblings(`.${this.errorMessageClass}`).remove();
        
        // Add new error message
        $element.after(`<div class="${this.errorMessageClass}">${message}</div>`);
    }

    // Show success state
    showSuccess(element) {
        const $element = $(element);
        $element.removeClass(this.errorClass).addClass(this.successClass);
        $element.siblings(`.${this.errorMessageClass}`).remove();
    }

    // Clear validation state
    clearValidation(element) {
        const $element = $(element);
        $element.removeClass(this.errorClass + ' ' + this.successClass);
        $element.siblings(`.${this.errorMessageClass}`).remove();
    }

    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation
    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Phone validation
    validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // ZIP code validation
    validateZipCode(zipcode) {
        const zipRegex = /^\d{4,5}$/;
        return zipRegex.test(zipcode);
    }

    // File validation
    validateFile(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) {
        if (!file) return { valid: true, message: '' };
        
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, message: 'Please select a valid image file (JPEG, PNG, GIF)' };
        }
        
        if (file.size > maxSize) {
            return { valid: false, message: 'File size must be less than 5MB' };
        }
        
        return { valid: true, message: '' };
    }

    // Registration form validation
    initRegistrationValidation() {
        const $form = $('#registerForm');
        if (!$form.length) return;

        // Real-time validation
        $form.find('input').on('blur', function() {
            validateRegistrationField(this);
        });

        // Form submission validation
        $form.on('submit', function(e) {
            e.preventDefault();
            
            if (validateRegistrationForm()) {
                // Form is valid, proceed with submission
                submitRegistrationForm();
            }
        });
    }

    // Login form validation
    initLoginValidation() {
        const $form = $('#loginForm');
        if (!$form.length) return;

        // Real-time validation
        $form.find('input').on('blur', function() {
            validateLoginField(this);
        });

        // Login button click
        $('#login').on('click', function(e) {
            e.preventDefault();
            
            if (validateLoginForm()) {
                // Form is valid, proceed with login
                submitLoginForm();
            }
        });
    }

    // Product form validation
    initProductFormValidation() {
        const $form = $('#productForm');
        if (!$form.length) return;

        // Real-time validation
        $form.find('input, select, textarea').on('blur', function() {
            validateProductField(this);
        });

        // Form submission validation
        $form.on('submit', function(e) {
            e.preventDefault();
            
            if (validateProductForm()) {
                // Form is valid, proceed with submission
                submitProductForm();
            }
        });
    }

    // Profile form validation
    initProfileFormValidation() {
        const $form = $('#profileForm');
        if (!$form.length) return;

        // Real-time validation
        $form.find('input').on('blur', function() {
            validateProfileField(this);
        });

        // Form submission validation
        $form.on('submit', function(e) {
            e.preventDefault();
            
            if (validateProfileForm()) {
                // Form is valid, proceed with submission
                submitProfileForm();
            }
        });
    }
}

// Registration field validation
function validateRegistrationField(field) {
    const $field = $(field);
    const value = $field.val().trim();
    const fieldName = $field.attr('name');
    
    validator.clearValidation(field);

    switch (fieldName) {
        case 'email':
            if (!value) {
                validator.showError(field, 'Email is required');
                return false;
            }
            if (!validator.validateEmail(value)) {
                validator.showError(field, 'Please enter a valid email address');
                return false;
            }
            break;

        case 'password':
            if (!value) {
                validator.showError(field, 'Password is required');
                return false;
            }
            if (!validator.validatePassword(value)) {
                validator.showError(field, 'Password must be at least 8 characters with uppercase, lowercase, and number');
                return false;
            }
            break;

        case 'title':
            if (!value) {
                validator.showError(field, 'Title is required');
                return false;
            }
            if (value.length < 2) {
                validator.showError(field, 'Title must be at least 2 characters');
                return false;
            }
            break;

        case 'fname':
        case 'lname':
            if (!value) {
                validator.showError(field, `${fieldName === 'fname' ? 'First' : 'Last'} name is required`);
                return false;
            }
            if (value.length < 2) {
                validator.showError(field, `${fieldName === 'fname' ? 'First' : 'Last'} name must be at least 2 characters`);
                return false;
            }
            if (!/^[a-zA-Z\s]+$/.test(value)) {
                validator.showError(field, `${fieldName === 'fname' ? 'First' : 'Last'} name can only contain letters and spaces`);
                return false;
            }
            break;

        case 'addressline':
            if (!value) {
                validator.showError(field, 'Address is required');
                return false;
            }
            if (value.length < 5) {
                validator.showError(field, 'Address must be at least 5 characters');
                return false;
            }
            break;

        case 'town':
            if (!value) {
                validator.showError(field, 'Town is required');
                return false;
            }
            if (value.length < 2) {
                validator.showError(field, 'Town must be at least 2 characters');
                return false;
            }
            break;

        case 'phone':
            if (!value) {
                validator.showError(field, 'Phone number is required');
                return false;
            }
            if (!validator.validatePhone(value)) {
                validator.showError(field, 'Please enter a valid phone number');
                return false;
            }
            break;

        case 'zipcode':
            if (!value) {
                validator.showError(field, 'Postcode is required');
                return false;
            }
            if (!validator.validateZipCode(value)) {
                validator.showError(field, 'Please enter a valid 4-5 digit postcode');
                return false;
            }
            break;
    }

    validator.showSuccess(field);
    return true;
}

// Registration form validation
function validateRegistrationForm() {
    let isValid = true;
    const requiredFields = ['email', 'password', 'title', 'fname', 'lname', 'addressline', 'town', 'phone', 'zipcode'];
    
    requiredFields.forEach(fieldName => {
        const field = $(`[name="${fieldName}"]`)[0];
        if (!validateRegistrationField(field)) {
            isValid = false;
        }
    });

    // Validate image file if selected
    const imageFile = $('#avatar')[0].files[0];
    if (imageFile) {
        const fileValidation = validator.validateFile(imageFile);
        if (!fileValidation.valid) {
            validator.showError('#avatar', fileValidation.message);
            isValid = false;
        }
    }

    return isValid;
}

// Login field validation
function validateLoginField(field) {
    const $field = $(field);
    const value = $field.val().trim();
    const fieldName = $field.attr('name');
    
    validator.clearValidation(field);

    switch (fieldName) {
        case 'email':
            if (!value) {
                validator.showError(field, 'Email is required');
                return false;
            }
            if (!validator.validateEmail(value)) {
                validator.showError(field, 'Please enter a valid email address');
                return false;
            }
            break;

        case 'password':
            if (!value) {
                validator.showError(field, 'Password is required');
                return false;
            }
            if (value.length < 6) {
                validator.showError(field, 'Password must be at least 6 characters');
                return false;
            }
            break;
    }

    validator.showSuccess(field);
    return true;
}

// Login form validation
function validateLoginForm() {
    let isValid = true;
    const requiredFields = ['email', 'password'];
    
    requiredFields.forEach(fieldName => {
        const field = $(`[name="${fieldName}"]`)[0];
        if (!validateLoginField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

// Product field validation
function validateProductField(field) {
    const $field = $(field);
    const value = $field.val().trim();
    const fieldName = $field.attr('name');
    
    validator.clearValidation(field);

    switch (fieldName) {
        case 'description':
            if (!value) {
                validator.showError(field, 'Product description is required');
                return false;
            }
            if (value.length < 5) {
                validator.showError(field, 'Description must be at least 5 characters');
                return false;
            }
            break;

        case 'cost_price':
        case 'sell_price':
            if (!value) {
                validator.showError(field, `${fieldName === 'cost_price' ? 'Cost' : 'Sell'} price is required`);
                return false;
            }
            if (isNaN(value) || parseFloat(value) <= 0) {
                validator.showError(field, 'Please enter a valid positive number');
                return false;
            }
            break;

        case 'quantity':
            if (!value) {
                validator.showError(field, 'Stock quantity is required');
                return false;
            }
            if (isNaN(value) || parseInt(value) < 0) {
                validator.showError(field, 'Please enter a valid non-negative number');
                return false;
            }
            break;
    }

    validator.showSuccess(field);
    return true;
}

// Product form validation
function validateProductForm() {
    let isValid = true;
    const requiredFields = ['description', 'cost_price', 'sell_price', 'quantity'];
    
    requiredFields.forEach(fieldName => {
        const field = $(`[name="${fieldName}"]`)[0];
        if (!validateProductField(field)) {
            isValid = false;
        }
    });

    // Validate image files if selected
    const mainImage = $('#image')[0].files[0];
    if (mainImage) {
        const fileValidation = validator.validateFile(mainImage);
        if (!fileValidation.valid) {
            validator.showError('#image', fileValidation.message);
            isValid = false;
        }
    }

    const galleryImages = $('#images')[0].files;
    for (let i = 0; i < galleryImages.length; i++) {
        const fileValidation = validator.validateFile(galleryImages[i]);
        if (!fileValidation.valid) {
            validator.showError('#images', fileValidation.message);
            isValid = false;
            break;
        }
    }

    return isValid;
}

// Profile field validation
function validateProfileField(field) {
    const $field = $(field);
    const value = $field.val().trim();
    const fieldName = $field.attr('name');
    
    validator.clearValidation(field);

    switch (fieldName) {
        case 'title':
            if (!value) {
                validator.showError(field, 'Title is required');
                return false;
            }
            break;

        case 'fname':
        case 'lname':
            if (!value) {
                validator.showError(field, `${fieldName === 'fname' ? 'First' : 'Last'} name is required`);
                return false;
            }
            if (!/^[a-zA-Z\s]+$/.test(value)) {
                validator.showError(field, `${fieldName === 'fname' ? 'First' : 'Last'} name can only contain letters and spaces`);
                return false;
            }
            break;

        case 'addressline':
            if (!value) {
                validator.showError(field, 'Address is required');
                return false;
            }
            break;

        case 'town':
            if (!value) {
                validator.showError(field, 'Town is required');
                return false;
            }
            break;

        case 'phone':
            if (!value) {
                validator.showError(field, 'Phone number is required');
                return false;
            }
            if (!validator.validatePhone(value)) {
                validator.showError(field, 'Please enter a valid phone number');
                return false;
            }
            break;

        case 'zipcode':
            if (!value) {
                validator.showError(field, 'Postcode is required');
                return false;
            }
            if (!validator.validateZipCode(value)) {
                validator.showError(field, 'Please enter a valid 4-5 digit postcode');
                return false;
            }
            break;
    }

    validator.showSuccess(field);
    return true;
}

// Profile form validation
function validateProfileForm() {
    let isValid = true;
    const requiredFields = ['title', 'fname', 'lname', 'addressline', 'town', 'phone', 'zipcode'];
    
    requiredFields.forEach(fieldName => {
        const field = $(`[name="${fieldName}"]`)[0];
        if (!validateProfileField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

// Form submission functions (these will call the existing form submission logic)
function submitRegistrationForm() {
    // Call the existing registration logic from user.js
    if (typeof window.submitRegistration === 'function') {
        window.submitRegistration();
    } else {
        // Fallback to default form submission
        $('#registerForm')[0].submit();
    }
}

function submitLoginForm() {
    // Call the existing login logic from user.js
    if (typeof window.submitLogin === 'function') {
        window.submitLogin();
    } else {
        // Fallback to default form submission
        $('#loginForm')[0].submit();
    }
}

function submitProductForm() {
    // Call the existing product submission logic from item.js
    if (typeof window.submitProduct === 'function') {
        window.submitProduct();
    } else {
        // Fallback to default form submission
        $('#productForm')[0].submit();
    }
}

function submitProfileForm() {
    // Call the existing profile update logic from user.js
    if (typeof window.submitProfile === 'function') {
        window.submitProfile();
    } else {
        // Fallback to default form submission
        $('#profileForm')[0].submit();
    }
}

// Initialize validation when document is ready
$(document).ready(function() {
    window.validator = new FormValidator();
    window.validator.init();
}); 