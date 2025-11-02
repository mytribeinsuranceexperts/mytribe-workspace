"""
CQC Regulated Activities Extraction Module

Extracts regulated activities with codes, names, and contacts from CQC API responses.
Designed for use with myTribe CQC integration.

Usage:
    from cqc_activity_extraction import transform_regulated_activities

    location_data = {...}  # CQC API response
    result = transform_regulated_activities(location_data)

    # Access extracted data
    simple_list = result["activities_simple"]  # TEXT[] for backward compat
    detailed_list = result["activities_detailed"]  # JSONB with full detail
"""

from typing import Any, Dict, List, Optional, Tuple


def validate_regulated_activity(activity: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate a single regulated activity entry.

    Args:
        activity: Single activity dict from CQC API

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Required: code
    code = activity.get("code")
    if not code:
        errors.append("Missing activity code")
    elif not isinstance(code, str):
        errors.append(f"Activity code must be string, got {type(code)}")
    elif not code.startswith("RA"):
        errors.append(f"Invalid activity code format: {code}")

    # Required: name
    name = activity.get("name")
    if not name:
        errors.append("Missing activity name")
    elif not isinstance(name, str):
        errors.append(f"Activity name must be string, got {type(name)}")

    # Optional: contacts validation
    contacts = activity.get("contacts", [])
    if contacts is not None:
        if not isinstance(contacts, list):
            errors.append("Contacts must be an array")
        else:
            for idx, contact in enumerate(contacts):
                if not isinstance(contact, dict):
                    errors.append(f"Contact {idx} must be a dictionary")
                    continue

                roles = contact.get("personRoles", [])
                if roles and not isinstance(roles, list):
                    errors.append(f"Contact {idx}: personRoles must be an array")

    return (len(errors) == 0, errors)


def validate_contact(contact: Dict[str, Any]) -> bool:
    """
    Validate that contact has at least one meaningful field.

    Args:
        contact: Contact dictionary

    Returns:
        True if contact has at least one non-None, non-empty value
    """
    return any(
        v for v in [
            contact.get("personTitle"),
            contact.get("personGivenName"),
            contact.get("personFamilyName"),
            contact.get("personRoles")
        ] if v
    )


def extract_contact_data(contact: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Extract and normalize contact data.

    Args:
        contact: Raw contact dict from CQC API

    Returns:
        Normalized contact dict or None if invalid
    """
    if not isinstance(contact, dict):
        return None

    contact_data = {
        "title": contact.get("personTitle"),
        "given_name": contact.get("personGivenName"),
        "family_name": contact.get("personFamilyName"),
        "roles": contact.get("personRoles", [])
    }

    # Only return if at least one field has a value
    if validate_contact(contact):
        return contact_data

    return None


def transform_regulated_activities(
    location: Dict[str, Any],
    validate: bool = True,
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Extract regulated activities with codes and contacts.

    Args:
        location: Raw location data from CQC API
        validate: Whether to validate activities (default: True)
        verbose: Whether to print warnings for validation errors (default: False)

    Returns:
        Dictionary containing:
        {
            "activities_simple": ["Activity 1", "Activity 2"],  # TEXT[] backward compat
            "activities_detailed": [                             # JSONB detailed data
                {
                    "code": "RA2",
                    "name": "Accommodation for persons...",
                    "contacts": [
                        {
                            "title": "Ms",
                            "given_name": "Rebecca Jane",
                            "family_name": "Bewley",
                            "roles": ["Registered Manager"]
                        }
                    ]
                }
            ],
            "extraction_errors": [...] # Only if errors occurred
        }

    Example:
        >>> location = {
        ...     "locationId": "1-123",
        ...     "regulatedActivities": [
        ...         {
        ...             "code": "RA5",
        ...             "name": "Treatment of disease, disorder or injury",
        ...             "contacts": [
        ...                 {
        ...                     "personTitle": "Dr",
        ...                     "personGivenName": "John",
        ...                     "personFamilyName": "Smith",
        ...                     "personRoles": ["Registered Manager"]
        ...                 }
        ...             ]
        ...         }
        ...     ]
        ... }
        >>> result = transform_regulated_activities(location)
        >>> result["activities_simple"]
        ['Treatment of disease, disorder or injury']
        >>> result["activities_detailed"][0]["code"]
        'RA5'
    """
    activities_raw = location.get("regulatedActivities", [])

    # Handle None or non-list values
    if not activities_raw:
        return {
            "activities_simple": None,
            "activities_detailed": None
        }

    if not isinstance(activities_raw, list):
        return {
            "activities_simple": None,
            "activities_detailed": None,
            "extraction_errors": ["regulatedActivities is not a list"]
        }

    activities_simple = []
    activities_detailed = []
    errors = []

    for idx, activity in enumerate(activities_raw):
        if not isinstance(activity, dict):
            error_msg = f"Activity {idx}: Not a dictionary (type: {type(activity)})"
            errors.append(error_msg)
            if verbose:
                print(f"WARN: {error_msg}")
            continue

        # Validate if requested
        if validate:
            is_valid, validation_errors = validate_regulated_activity(activity)
            if not is_valid:
                error_msg = f"Activity {idx}: {', '.join(validation_errors)}"
                errors.append(error_msg)
                if verbose:
                    print(f"WARN: {error_msg}")
                continue

        # Extract basic fields
        code = activity.get("code")
        name = activity.get("name")

        # Skip if missing required fields
        if not code or not name:
            error_msg = f"Activity {idx}: Missing code or name"
            errors.append(error_msg)
            if verbose:
                print(f"WARN: {error_msg}")
            continue

        # Add to simple list (TEXT[] array)
        activities_simple.append(name)

        # Extract and normalize contacts
        contacts_raw = activity.get("contacts", [])
        contacts_processed = []

        if isinstance(contacts_raw, list):
            for contact in contacts_raw:
                contact_data = extract_contact_data(contact)
                if contact_data:
                    contacts_processed.append(contact_data)

        # Add to detailed list (JSONB array)
        activities_detailed.append({
            "code": code,
            "name": name,
            "contacts": contacts_processed
        })

    # Log errors if any and verbose mode enabled
    if errors and verbose:
        location_id = location.get("locationId", "unknown")
        print(f"WARN: Errors extracting activities for {location_id}:")
        for error in errors:
            print(f"  - {error}")

    # Build result dictionary
    result = {
        "activities_simple": activities_simple if activities_simple else None,
        "activities_detailed": activities_detailed if activities_detailed else None
    }

    # Include errors if any occurred
    if errors:
        result["extraction_errors"] = errors

    return result


def get_activity_codes(activities_detailed: List[Dict[str, Any]]) -> List[str]:
    """
    Extract just the activity codes from detailed activities.

    Args:
        activities_detailed: List of detailed activity dicts

    Returns:
        List of activity codes (e.g., ["RA2", "RA5"])

    Example:
        >>> activities = [
        ...     {"code": "RA2", "name": "...", "contacts": []},
        ...     {"code": "RA5", "name": "...", "contacts": []}
        ... ]
        >>> get_activity_codes(activities)
        ['RA2', 'RA5']
    """
    if not activities_detailed or not isinstance(activities_detailed, list):
        return []

    return [
        activity["code"]
        for activity in activities_detailed
        if isinstance(activity, dict) and "code" in activity
    ]


def get_registered_managers(
    activities_detailed: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Extract all registered managers from activities.

    Args:
        activities_detailed: List of detailed activity dicts

    Returns:
        List of unique registered managers with their activities

    Example:
        >>> activities = [
        ...     {
        ...         "code": "RA2",
        ...         "name": "Accommodation...",
        ...         "contacts": [
        ...             {
        ...                 "given_name": "Rebecca",
        ...                 "family_name": "Bewley",
        ...                 "roles": ["Registered Manager"]
        ...             }
        ...         ]
        ...     }
        ... ]
        >>> managers = get_registered_managers(activities)
        >>> managers[0]["family_name"]
        'Bewley'
    """
    if not activities_detailed or not isinstance(activities_detailed, list):
        return []

    managers = []

    for activity in activities_detailed:
        if not isinstance(activity, dict):
            continue

        contacts = activity.get("contacts", [])
        activity_code = activity.get("code")

        for contact in contacts:
            if not isinstance(contact, dict):
                continue

            roles = contact.get("roles", [])
            if "Registered Manager" in roles:
                manager_data = {
                    "title": contact.get("title"),
                    "given_name": contact.get("given_name"),
                    "family_name": contact.get("family_name"),
                    "roles": roles,
                    "activity_code": activity_code
                }
                managers.append(manager_data)

    return managers


def has_activity(
    activities_detailed: List[Dict[str, Any]],
    activity_code: str
) -> bool:
    """
    Check if location has a specific regulated activity.

    Args:
        activities_detailed: List of detailed activity dicts
        activity_code: Activity code to check (e.g., "RA5")

    Returns:
        True if activity is present

    Example:
        >>> activities = [{"code": "RA2", "name": "...", "contacts": []}]
        >>> has_activity(activities, "RA2")
        True
        >>> has_activity(activities, "RA5")
        False
    """
    if not activities_detailed or not isinstance(activities_detailed, list):
        return False

    activity_codes = get_activity_codes(activities_detailed)
    return activity_code in activity_codes


# CQC Regulated Activity Types Reference (RA1-RA16)
# This can be used to seed a reference table or validate codes
REGULATED_ACTIVITY_TYPES = {
    "RA1": "Assessment or medical treatment for persons detained under the Mental Health Act 1983",
    "RA2": "Accommodation for persons who require nursing or personal care",
    "RA3": "Accommodation for persons who require treatment for substance misuse",
    "RA4": "Accommodation and nursing or personal care in the further education sector",
    "RA5": "Treatment of disease, disorder or injury",
    "RA6": "Diagnostic and screening procedures",
    "RA7": "Management of supply of blood and blood derived products",
    "RA8": "Transport services, triage and medical advice provided remotely",
    "RA9": "Maternity and midwifery services",
    "RA10": "Termination of pregnancies",
    "RA11": "Services in slimming clinics",
    "RA12": "Nursing care",
    "RA13": "Personal care",
    "RA14": "Surgical procedures",
    "RA15": "Family planning services",
    "RA16": "Treatment of disease, disorder or injury"
}


def get_activity_name_by_code(activity_code: str) -> Optional[str]:
    """
    Get the standard activity name for a given code.

    Args:
        activity_code: Activity code (e.g., "RA5")

    Returns:
        Activity name or None if not found

    Example:
        >>> get_activity_name_by_code("RA5")
        'Treatment of disease, disorder or injury'
    """
    return REGULATED_ACTIVITY_TYPES.get(activity_code)


if __name__ == "__main__":
    # Example usage and testing
    sample_location = {
        "locationId": "1-10000302982",
        "name": "Henley House",
        "regulatedActivities": [
            {
                "name": "Accommodation for persons who require nursing or personal care",
                "code": "RA2",
                "contacts": [
                    {
                        "personTitle": "Ms",
                        "personGivenName": "Rebecca Jane",
                        "personFamilyName": "Bewley",
                        "personRoles": ["Registered Manager"]
                    }
                ]
            }
        ]
    }

    print("Testing CQC Activity Extraction Module")
    print("=" * 60)

    result = transform_regulated_activities(sample_location, verbose=True)

    print("\nSimple List (TEXT[]):")
    print(result["activities_simple"])

    print("\nDetailed List (JSONB):")
    import json
    print(json.dumps(result["activities_detailed"], indent=2))

    print("\nActivity Codes:")
    codes = get_activity_codes(result["activities_detailed"])
    print(codes)

    print("\nRegistered Managers:")
    managers = get_registered_managers(result["activities_detailed"])
    print(json.dumps(managers, indent=2))

    print("\nHas RA2?", has_activity(result["activities_detailed"], "RA2"))
    print("Has RA5?", has_activity(result["activities_detailed"], "RA5"))

    print("\n✓ Module test complete")
