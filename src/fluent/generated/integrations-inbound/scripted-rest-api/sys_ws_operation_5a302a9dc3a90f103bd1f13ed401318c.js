(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    'use strict';

    response.setContentType('application/json');

    // --- 1. Parse and validate the request body ---
    var body = request.body ? request.body.data : null;

    if (!body || !body.sys_id) {
        response.setStatus(400);
        response.setBody({
            error: {
                message: 'Bad Request: Missing required field "sys_id" in request body.',
                detail: 'Provide sys_id along with fields to update (name, value, type, description).'
            }
        });
        return;
    }

    var sysId = String(body.sys_id);
    var payload = {};

    // Only include fields that were actually provided
    if (body.name !== undefined) payload.name = String(body.name);
    if (body.value !== undefined) payload.value = String(body.value);
    if (body.type !== undefined) payload.type = String(body.type);
    if (body.description !== undefined) payload.description = String(body.description);

    if (Object.keys(payload).length === 0) {
        response.setStatus(400);
        response.setBody({
            error: {
                message: 'Bad Request: No updatable fields provided.',
                detail: 'Include at least one of: name, value, type, description.'
            }
        });
        return;
    }

    // --- 2. Delegate to the Global Script Include ---
    try {
        var helper = new global.PropertiesHelperGlobal();
        var result = helper.updateProperty(sysId, payload);

        if (result) {
            response.setStatus(200);
            response.setBody({
                result: {
                    sys_id: sysId,
                    message: 'Property updated successfully.'
                }
            });
        } else {
            response.setStatus(404);
            response.setBody({
                error: {
                    message: 'Not Found: Property with sys_id "' + sysId + '" does not exist or could not be updated.'
                }
            });
        }
    } catch (e) {
        response.setStatus(500);
        response.setBody({
            error: {
                message: 'Internal Server Error: ' + e.message,
                detail: 'An unexpected error occurred while updating the property.'
            }
        });
    }

})(request, response);