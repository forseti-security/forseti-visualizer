# WINDOWS Notes

To source in environment variables on a Windows Operating System, run the following command within the PS1 Terminal:

```ps1
$env:API_HOST="0.0.0.1"
$env:API_PORT="8083"
$env:CLOUDSQL_HOSTNAME="127.0.0.1"
$env:CLOUDSQL_USERNAME="forseti_security_user"
$env:CLOUDSQL_PASSWORD=""
$env:CLOUDSQL_SCHEMA="forseti_security"
$env:FORSETI_SERVER_VM_CHANNEL="35.232.70.205:50051"
$env:FORSETI_DATA_MODEL_HANDLE="1d11c1d62a7e589153f10512d09710fe"
$env:PROJECT_ID="forseti-analytics"
$env:CACHE_ENABLED="true"
```

Alternatively, you can run the following

```ps1
$EnvVars = Get-Content source.ps1.tpl
$EnvVars | foreach {
    $name, $value = $_.split('=')
    Set-Content env:\$name $value
}
```