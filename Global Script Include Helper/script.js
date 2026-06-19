var PropertiesHelperGlobal = Class.create();
PropertiesHelperGlobal.prototype = {
    initialize: function() {
        // Blocked property prefixes — core platform properties that must never be modified
        this.BLOCKED_PREFIXES = ['glide.', 'com.glide.', 'instance.'];

        // The global scope sys_id (properties in global scope are protected)
        this.GLOBAL_SCOPE_ID = 'global';
    },

    // ================================================================
    // SECURITY GATE: Common validation for all write/delete operations
    // Returns: { allowed: true } or { allowed: false, reason: '...' }
    // ================================================================
    _validateAccess: function(sysId, operation) {
        var caller = gs.getUserName();

        // --- 1. Role Check: Require admin role ---
        if (!gs.hasRole('admin')) {
            gs.error('[PropertiesHelperGlobal] SECURITY BLOCKED: User "' + caller +
                '" attempted to ' + operation + ' property (sys_id: ' + sysId +
                ') without admin role.');
            return { allowed: false, reason: 'Insufficient privileges. Admin role required.' };
        }

        // --- 2. Retrieve the property record ---
        var gr = new GlideRecord('sys_properties');
        if (!gr.get(sysId)) {
            gs.error('[PropertiesHelperGlobal] ' + operation.toUpperCase() +
                ' FAILED: Property not found (sys_id: ' + sysId +
                '). Caller: ' + caller);
            return { allowed: false, reason: 'Property not found.' };
        }

        var propName = gr.getValue('name') || '';
        var propScope = gr.getValue('sys_scope') || '';

        // --- 3. System Property Protection (Blocklist) ---
        for (var i = 0; i < this.BLOCKED_PREFIXES.length; i++) {
            if (propName.indexOf(this.BLOCKED_PREFIXES[i]) === 0) {
                gs.error('[PropertiesHelperGlobal] SECURITY BLOCKED: User "' + caller +
                    '" attempted to ' + operation + ' protected system property "' +
                    propName + '" (prefix: ' + this.BLOCKED_PREFIXES[i] +
                    '). sys_id: ' + sysId);
                return {
                    allowed: false,
                    reason: 'Cannot modify protected system property with prefix "' +
                        this.BLOCKED_PREFIXES[i] + '".'
                };
            }
        }

        // --- 4. Scope Check: Block modification of global-scope properties ---
        if (propScope === this.GLOBAL_SCOPE_ID || propScope === '') {
            gs.error('[PropertiesHelperGlobal] SECURITY BLOCKED: User "' + caller +
                '" attempted to ' + operation + ' global-scope property "' +
                propName + '" (sys_id: ' + sysId +
                '). Only custom-scoped properties may be modified.');
            return {
                allowed: false,
                reason: 'Cannot modify global-scope properties. Only custom application-scoped properties are allowed.'
            };
        }

        // All checks passed — return the GlideRecord for reuse
        return { allowed: true, record: gr, propName: propName, caller: caller };
    },

    // ================================================================
    // UPDATE PROPERTY (security-hardened)
    // ================================================================
    updateProperty: function(sysId, payload) {
        var validation = this._validateAccess(sysId, 'update');
        if (!validation.allowed) {
            return { success: false, error: validation.reason };
        }

        var gr = validation.record;

        // Apply field updates
        if (payload.name !== undefined) gr.setValue('name', payload.name);
        if (payload.value !== undefined) gr.setValue('value', payload.value);
        if (payload.type !== undefined) gr.setValue('type', payload.type);
        if (payload.description !== undefined) gr.setValue('description', payload.description);

        var result = gr.update();
        if (result) {
            gs.info('[PropertiesHelperGlobal] Property "' + validation.propName +
                '" (sys_id: ' + sysId + ') updated by "' + validation.caller + '".');
            return { success: true, sys_id: sysId };
        }

        gs.error('[PropertiesHelperGlobal] UPDATE FAILED: GlideRecord.update() returned false for "' +
            validation.propName + '" (sys_id: ' + sysId + '). Caller: ' + validation.caller);
        return { success: false, error: 'Database update failed.' };
    },

    // ================================================================
    // DELETE PROPERTY (security-hardened)
    // ================================================================
    deleteProperty: function(sysId) {
        var validation = this._validateAccess(sysId, 'delete');
        if (!validation.allowed) {
            return { success: false, error: validation.reason };
        }

        var gr = validation.record;
        var propName = validation.propName;

        var result = gr.deleteRecord();
        if (result) {
            gs.info('[PropertiesHelperGlobal] Property "' + propName +
                '" (sys_id: ' + sysId + ') DELETED by "' + validation.caller + '".');
            return { success: true };
        }

        gs.error('[PropertiesHelperGlobal] DELETE FAILED: GlideRecord.deleteRecord() returned false for "' +
            propName + '" (sys_id: ' + sysId + '). Caller: ' + validation.caller);
        return { success: false, error: 'Database delete failed.' };
    },

    // ================================================================
    // CREATE PROPERTY (security-hardened)
    // ================================================================
    createProperty: function(payload) {
        var caller = gs.getUserName();

        // --- Role Check ---
        if (!gs.hasRole('admin')) {
            gs.error('[PropertiesHelperGlobal] SECURITY BLOCKED: User "' + caller +
                '" attempted to create property without admin role.');
            return { success: false, error: 'Insufficient privileges. Admin role required.' };
        }

        // --- System Property Protection ---
        var propName = payload.name || '';
        for (var i = 0; i < this.BLOCKED_PREFIXES.length; i++) {
            if (propName.indexOf(this.BLOCKED_PREFIXES[i]) === 0) {
                gs.error('[PropertiesHelperGlobal] SECURITY BLOCKED: User "' + caller +
                    '" attempted to create protected system property "' + propName +
                    '" (prefix: ' + this.BLOCKED_PREFIXES[i] + ').');
                return {
                    success: false,
                    error: 'Cannot create property with protected prefix "' +
                        this.BLOCKED_PREFIXES[i] + '".'
                };
            }
        }

        // --- Scope Check: Must target a custom (non-global) scope ---
        var targetScope = payload.sys_scope || '';
        if (targetScope === this.GLOBAL_SCOPE_ID || targetScope === '') {
            gs.error('[PropertiesHelperGlobal] SECURITY BLOCKED: User "' + caller +
                '" attempted to create property "' + propName + '" in global scope.');
            return {
                success: false,
                error: 'Cannot create properties in global scope. Specify a custom application scope.'
            };
        }

        // --- Insert ---
        var gr = new GlideRecord('sys_properties');
        gr.initialize();
        gr.setValue('name', propName);
        gr.setValue('value', payload.value || '');
        gr.setValue('type', payload.type || 'string');
        gr.setValue('description', payload.description || '');
        gr.setValue('sys_scope', targetScope);

        var sysId = gr.insert();
        if (sysId) {
            gs.info('[PropertiesHelperGlobal] Property "' + propName +
                '" (sys_id: ' + sysId + ') CREATED by "' + caller +
                '" in scope: ' + targetScope);
            return { success: true, sys_id: sysId };
        }

        gs.error('[PropertiesHelperGlobal] CREATE FAILED: GlideRecord.insert() returned false for "' +
            propName + '". Caller: ' + caller);
        return { success: false, error: 'Insert failed. The property name may already exist.' };
    },

    type: 'PropertiesHelperGlobal'
};