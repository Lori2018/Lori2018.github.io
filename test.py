import json
import re

# Define hash patterns
HASH_PATTERNS = {
    "SHA256": r'\b[a-fA-F0-9]{64}\b',           # 64-character hexadecimal (SHA-256)
    "SHA1": r'\b[a-fA-F0-9]{40}\b',             # 40-character hexadecimal (SHA-1)
    "MD5": r'\b[a-fA-F0-9]{32}\b',              # 32-character hexadecimal (MD5)
    "Base64": r'\b[A-Za-z0-9+/=]{16,}\b',       # Base64 strings
    "UUID": r'\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b'  # UUID format
}

def extract_potential_hashes(har_file):
    """Extract potential hashes from a HAR file."""
    try:
        with open(har_file, 'r', encoding='utf-8') as file:
            har_data = json.load(file)
    except UnicodeDecodeError:
        raise ValueError("Error decoding HAR file: the file may not be UTF-8 encoded.")
    except json.JSONDecodeError:
        raise ValueError("Error parsing HAR file: the file may be malformed.")
    except FileNotFoundError:
        raise ValueError(f"File not found: {har_file}")
    except Exception as e:
        raise ValueError(f"An unexpected error occurred while reading the HAR file: {e}")
    
    potential_hashes = []

    # Extract entries from the HAR file
    entries = har_data.get("log", {}).get("entries", [])
    for entry in entries:
        # Check request headers, query params, and bodies
        request = entry.get("request", {})
        response = entry.get("response", {})
        
        # Combine request/response content into a single string for scanning
        content = []

        # Scan request data
        content += [str(request.get("url", ""))]
        content += [header["value"] for header in request.get("headers", [])]
        content += [query["value"] for query in request.get("queryString", [])]
        if "postData" in request:
            content += [request["postData"].get("text", "")]

        # Scan response data
        content += [header["value"] for header in response.get("headers", [])]
        if "content" in response.get("body", {}):
            content += [response["content"]["body"]]

        # Combine all collected content
        combined_content = "\n".join(content)

        # Search for hash patterns
        for hash_type, pattern in HASH_PATTERNS.items():
            matches = re.findall(pattern, combined_content)
            for match in matches:
                potential_hashes.append((hash_type, match))

    return potential_hashes

def main():
    # Input HAR file
    har_file = input("Enter the path to your HAR file: ")

    try:
        # Extract potential hashes
        results = extract_potential_hashes(har_file)
        if results:
            print("Potential Hashes Found:")
            for hash_type, hash_value in results:
                print(f"{hash_type}: {hash_value}")
        else:
            print("No potential hashes found.")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
