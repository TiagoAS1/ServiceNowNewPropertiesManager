import { RestApi } from '@servicenow/sdk/core'

RestApi({
    $id: Now.ID['17ef9e5dc3a90f103bd1f13ed4013126'],
    name: 'Properties Manager',
    enforceAcl: ['9ef8bc918733320025fbd1a936cb0bdd'],
    serviceId: 'properties_manager',
    routes: [
        {
            $id: Now.ID['5a302a9dc3a90f103bd1f13ed401318c'],
            name: 'Update Property',
            consumes: 'application/json,application/xml,text/xml',
            method: 'PUT',
            script: Now.include('./sys_ws_operation_5a302a9dc3a90f103bd1f13ed401318c.js'),
            produces: 'application/json,application/xml,text/xml',
            path: '/update',
            enforceAcl: [],
        },
        {
            $id: Now.ID['609066ddc3a90f103bd1f13ed40131e8'],
            name: 'Delete Property',
            consumes: 'application/json,application/xml,text/xml',
            method: 'DELETE',
            script: Now.include('./sys_ws_operation_609066ddc3a90f103bd1f13ed40131e8.js'),
            produces: 'application/json,application/xml,text/xml',
            path: '/delete/{sys_id}',
            enforceAcl: [],
        },
        {
            $id: Now.ID['5d433c02c36103103bd1f13ed40131e2'],
            name: 'Create Property',
            consumes: 'application/json,application/xml,text/xml',
            method: 'POST',
            script: Now.include('./sys_ws_operation_5d433c02c36103103bd1f13ed40131e2.js'),
            produces: 'application/json,application/xml,text/xml',
            path: '/create',
            enforceAcl: [],
        },
    ],
})
