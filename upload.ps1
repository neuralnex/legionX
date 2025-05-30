# Read environment variables
$envContent = Get-Content .env
$envVars = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $envVars[$matches[1]] = $matches[2]
    }
}

$pinataJWT = $envVars['PINATA_JWT']
$pinataGateway = $envVars['PINATA_GATEWAY']

# Function to upload JSON to IPFS
function Upload-ToIPFS {
    param (
        [string]$FilePath,
        [string]$PinataJWT
    )

    $jsonContent = Get-Content -Raw -Path $FilePath
    $body = @{
        pinataMetadata = @{ name = (Split-Path $FilePath -Leaf) }
        pinataContent = $jsonContent | ConvertFrom-Json
    } | ConvertTo-Json -Depth 10

    $headers = @{
        "Authorization" = "Bearer $PinataJWT"
        "Content-Type" = "application/json"
    }

    try {
        $response = Invoke-RestMethod -Uri "https://api.pinata.cloud/pinning/pinJSONToIPFS" `
            -Method Post `
            -Headers $headers `
            -Body $body

        Write-Host "File uploaded successfully!"
        Write-Host "IPFS Hash: $($response.IpfsHash)"
        Write-Host "Gateway URL: $pinataGateway/ipfs/$($response.IpfsHash)"
        return $response.IpfsHash
    }
    catch {
        Write-Host "Error uploading file: $_"
        return $null
    }
}

# Upload model.json
Write-Host "Uploading model.json..."
$modelHash = Upload-ToIPFS -FilePath "model.json" -PinataJWT $pinataJWT

if ($modelHash) {
    # Update agent.json with the model hash
    $agentJson = Get-Content -Raw -Path "agent.json" | ConvertFrom-Json
    $agentJson.properties.files[0].src = "ipfs://$modelHash"
    $agentJson | ConvertTo-Json -Depth 10 | Set-Content "agent.json"

    # Upload agent.json
    Write-Host "`nUploading agent.json..."
    $agentHash = Upload-ToIPFS -FilePath "agent.json" -PinataJWT $pinataJWT

    if ($agentHash) {
        Write-Host "`nAll files uploaded successfully!"
        Write-Host "Model IPFS Hash: $modelHash"
        Write-Host "Agent IPFS Hash: $agentHash"
        Write-Host "`nYou can now use these hashes to create your listing."
    }
} 