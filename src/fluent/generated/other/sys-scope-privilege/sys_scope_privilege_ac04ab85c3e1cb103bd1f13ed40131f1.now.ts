import { CrossScopePrivilege } from '@servicenow/sdk/core'

CrossScopePrivilege({
    $id: Now.ID['ac04ab85c3e1cb103bd1f13ed40131f1'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sys_properties',
    targetScope: 'global',
    targetType: 'sys_db_object',
})
