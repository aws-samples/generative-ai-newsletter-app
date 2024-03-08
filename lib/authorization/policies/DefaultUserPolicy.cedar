permit (
    principal,
    action,
    resource
)
when { resource.account == principal.account };