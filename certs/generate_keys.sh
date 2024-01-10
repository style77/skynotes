#!/bin/bash

check_cfssl() {
    if command -v cfssl >/dev/null 2>&1 && command -v cfssljson >/dev/null 2>&1; then
        echo "CFSSL is already installed."
    else
        echo "CFSSL not found. Installing CFSSL..."
        # Install CFSSL (Example: using Homebrew)
        sudo apt install golang-cfssl
        if [ $? -eq 0 ]; then
            echo "CFSSL installed successfully."
        else
            echo "Failed to install CFSSL. Please install it manually and ensure it's in your PATH."
            exit 1
        fi
    fi
}

generate_csr_json() {
    local common_name="$1"
    cat <<EOF
{
  "CN": "$common_name",
  "key": {
      "algo": "ecdsa",
      "size": 256
  },
  "names": [
      {
          "C": "PL",
          "ST": "Kuyavian-Pomeranian",
          "L": "Warsaw"
      }
  ],
   "hosts": [
    "127.0.0.1",
    "localhost"
  ]
}
EOF
}

# Check if CFSSL is installed
check_cfssl

# Configuration JSONs
ca_config='ca-config.json'
ca_csr='ca-csr.json'
client_csr='client-csr.json'
server_csr='server-csr.json'

# CA config
cfssl print-defaults config > "$ca_config"

# Generate CA certificate
generate_csr_json "CA" > "$ca_csr"
cfssl gencert -initca "$ca_csr" | cfssljson -bare ca -

# Generate client certificate
generate_csr_json "client" > "$client_csr"
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config="$ca_config" -profile=client "$client_csr" | cfssljson -bare client

# Generate server certificate
echo "Creating www certificate..."

generate_csr_json "www" > "$server_csr"
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config="$ca_config" -hostname=127.0.0.1 -profile=www "$server_csr" | cfssljson -bare server

echo "Certificates generated successfully."