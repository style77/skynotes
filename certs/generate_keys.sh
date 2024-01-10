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

# Check if CFSSL is installed
check_cfssl

# Configuration JSONs
cfssl_config="cfssl.json"
csr_config="csr.json"
ca_name="Dev Testing CA"

# CA config
# Generate CA certificate
cfssl gencert -initca "$ca_csr" | cfssljson -bare ca -

cfssl selfsign -config "$cfssl_config" --profile rootca "$ca_name" "$csr_config" | cfssljson -bare root

cfssl genkey "$csr_config" | cfssljson -bare server
cfssl genkey "$csr_config" | cfssljson -bare client

cfssl sign -ca root.pem -ca-key root-key.pem -config "$cfssl_config" -profile server server.csr | cfssljson -bare server
cfssl sign -ca root.pem -ca-key root-key.pem -config "$cfssl_config" -profile client client.csr | cfssljson -bare client


echo "Certificates generated successfully."