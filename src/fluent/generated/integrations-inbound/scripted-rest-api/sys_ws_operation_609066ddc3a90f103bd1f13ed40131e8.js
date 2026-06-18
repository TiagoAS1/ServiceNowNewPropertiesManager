(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    'use strict';

    response.setContentType('application/json');

    // --- 1. Extract sys_id from path parameter ---
    var sysId = request.pathParams.sys_id;

    if (!sysId) {
        response.setStatus(400);
        response.setBody({
            error: {
                message: 'Bad Request: Missing path parameter "sys_id".',
                detail: 'Use: DELETE /api/x_589236_prprts/properties_manager/delete/{sys_id}'
            }
        });
        return;
    }

    // --- 2. Delegate to the Global Script Include ---
    try {
        var helper = new global.PropertiesHelperGlobal();
        var result = helper.deleteProperty(String(sysId));

        if (result) {
            response.setStatus(200);
            response.setBody({
                result: {
                    success: true,
                    sys_id: sysId,
                    message: 'Property deleted successfully.'
                }
            });
        } else {
            response.setStatus(404);
            response.setBody({
                error: {
                    message: 'Not Found: Property with sys_id "' + sysId + '" does not exist or could not be deleted.'
                }
            });
        }
    } catch (e) {
        response.setStatus(500);
        response.setBody({
            error: {
                message: 'Internal Server Error: ' + e.message,
                detail: 'An unexpected error occurred while deleting the property.'
            }
        });
    }

})(request, response);