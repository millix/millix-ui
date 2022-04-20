import * as format from './format';

export function required(field_name, value, error_list) {
    if (typeof value === 'string') {
        value = value.trim();
    }

    if (!value) {
        error_list.push({
            name   : get_error_name('required', field_name),
            message: `${field_name} is required`
        });
    }

    return value;
}

export function amount(field_name, value, error_list, allow_zero = false) {
    const value_escaped = integerPositive(field_name, value, error_list, allow_zero);
    if (format.millix(value_escaped, false) !== value) {
        error_list.push({
            name   : get_error_name('amount_format_is_wrong', field_name),
            message: `${field_name} must be a valid amount`
        });

    }

    return value_escaped;
}

export function integerPositive(field_name, value, error_list, allow_zero = false) {
    let value_escaped = value.toString().trim();
    value_escaped     = parseInt(value_escaped.replace(/\D/g, ''));

    if (!Number.isInteger(value_escaped)) {
        error_list.push({
            name   : get_error_name('value_is_not_integer', field_name),
            message: `${field_name} must be a number`
        });
    }
    else if (!allow_zero && value_escaped <= 0) {
        error_list.push({
            name   : get_error_name('value_is_lt_zero', field_name),
            message: `${field_name} must be bigger than 0`
        });
    }
    else if (allow_zero && value_escaped < 0) {
        error_list.push({
            name   : get_error_name('value_is_lte_zero', field_name),
            message: `${field_name} must be bigger than or equal to 0`
        });
    }

    return value_escaped;
}

export function ip(field_name, value, error_list) {
    let value_escaped   = [];
    let result_ip_octet = value.split('.');

    if (result_ip_octet.length !== 4) {
        error_list.push({
            name   : get_error_name('ip_octet_number', field_name),
            message: `${field_name} must be a valid ip address`
        });
    }
    else {
        result_ip_octet.forEach(element => {
            const element_number = Number(element);
            if (isNaN(element_number) || element_number > 255 || element_number < 0 || element === '') {
                error_list.push({
                    name   : get_error_name('ip_octet_wrong', field_name),
                    message: `${field_name} must be a valid ip address`
                });

                return false;
            }
            value_escaped.push(element_number);
        });
    }

    return value_escaped.join('.');
}

export function string_alphanumeric(field_name, value, error_list, length) {
    let value_escaped = value.toString().trim();
    let is_string = /^[a-zA-Z0-9]+$/.test(value_escaped);

    if (!is_string) {
        error_list.push({
            name   : get_error_name('value_is_not_alphanumeric_string', field_name),
            message: `${field_name} must be alphanumeric string`
        });
    }

    if (value_escaped.length > length) {
        error_list.push({
            name   : get_error_name('max_length_exceeded', field_name),
            message: `${field_name} max length is ${length} `
        });
    }

    return value_escaped;
}

export function json(field_name, value, error_list) {
    let result = value;

    try {
        result = JSON.parse(value);
    }
    catch (e) {
        error_list.push({
            name   : get_error_name('json_error', field_name),
            message: `${field_name} should contain valid json`
        });
    }

    return result;
}

function get_error_name(prefix, field_name) {
    return `${prefix}_${field_name.replaceAll(' ', '_')}`;
}

export function handleInputChangeInteger(e, allow_negative = true, formatter = 'number') {
    if (e.target.value.length === 0) {
        return;
    }

    let cursorStart = e.target.selectionStart,
        cursorEnd   = e.target.selectionEnd;
    let amount      = e.target.value.replace(/[,.]/g, '');
    if (!allow_negative) {
        amount = amount.replace(/-/g, '');
    }

    let offset = 0;
    if ((amount.length - 1) % 3 === 0) {
        offset = 1;
    }

    amount = parseInt(amount);

    let value = 0;
    if (!isNaN(amount)) {
        if (formatter === 'millix') {
            value = format.millix(amount, false);
        }
        else if (formatter === 'number') {
            value = format.number(amount);
        }
        else {
            value = amount;
        }
    }

    e.target.value = value;
    e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
}

export function handleInputChangeAlphanumericString(e, length = false) {
    if (e.target.value.length === 0) {
        return;
    }

    let value = e.target.value.replace(/[\W_]+/g, '');
    if (length !== false) {
        value = value.slice(0, length);
    }

    e.target.value = value;
}

export function handleInputChangeIpAddress(e) {
    if (e.target.value.length === 0) {
        return;
    }

    const ip_max_length = 15;
    let value           = e.target.value.replace(/[^0-9.]/g, '');
    value               = value.slice(0, ip_max_length);

    e.target.value = value;
}

export function handleAmountInputChange(e) {
    handleInputChangeInteger(e, false, 'millix');
}
