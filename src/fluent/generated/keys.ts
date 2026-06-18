import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    '17ef9e5dc3a90f103bd1f13ed4013126': {
                        table: 'sys_ws_definition'
                        id: '17ef9e5dc3a90f103bd1f13ed4013126'
                    }
                    '43012a11c3e90f103bd1f13ed4013100': {
                        table: 'sys_scope_privilege'
                        id: '43012a11c3e90f103bd1f13ed4013100'
                    }
                    '5601e611c3e90f103bd1f13ed401310e': {
                        table: 'sys_scope_privilege'
                        id: '5601e611c3e90f103bd1f13ed401310e'
                    }
                    '5a302a9dc3a90f103bd1f13ed401318c': {
                        table: 'sys_ws_operation'
                        id: '5a302a9dc3a90f103bd1f13ed401318c'
                    }
                    '609066ddc3a90f103bd1f13ed40131e8': {
                        table: 'sys_ws_operation'
                        id: '609066ddc3a90f103bd1f13ed40131e8'
                    }
                    '92016611c3e90f103bd1f13ed401313e': {
                        table: 'sys_scope_privilege'
                        id: '92016611c3e90f103bd1f13ed401313e'
                    }
                    '93246389c3e1cb103bd1f13ed4013137': {
                        table: 'sys_scope_privilege'
                        id: '93246389c3e1cb103bd1f13ed4013137'
                    }
                    '9a016611c3e90f103bd1f13ed4013137': {
                        table: 'sys_scope_privilege'
                        id: '9a016611c3e90f103bd1f13ed4013137'
                    }
                    ac04ab85c3e1cb103bd1f13ed40131f1: {
                        table: 'sys_scope_privilege'
                        id: 'ac04ab85c3e1cb103bd1f13ed40131f1'
                    }
                    b601e611c3e90f103bd1f13ed40131e9: {
                        table: 'sys_scope_privilege'
                        id: 'b601e611c3e90f103bd1f13ed40131e9'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '0bacbfc7f6854454a73c01746d0ee96a'
                    }
                    br0: {
                        table: 'sys_script'
                        id: '1d18d27a01574779a94a14652e284b84'
                        deleted: true
                    }
                    c134af49c3e1cb103bd1f13ed40131f0: {
                        table: 'sys_scope_privilege'
                        id: 'c134af49c3e1cb103bd1f13ed40131f0'
                    }
                    cs0: {
                        table: 'sys_script_client'
                        id: 'e56d1df8abdd4181a7c663e985f5c91a'
                        deleted: true
                    }
                    dc346389c3e1cb103bd1f13ed40131c0: {
                        table: 'sys_scope_privilege'
                        id: 'dc346389c3e1cb103bd1f13ed40131c0'
                    }
                    e601e611c3e90f103bd1f13ed4013112: {
                        table: 'sys_scope_privilege'
                        id: 'e601e611c3e90f103bd1f13ed4013112'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '8aa55f457e9b4aa3a69205511edfb8e5'
                    }
                    src_server_script_js: {
                        table: 'sys_module'
                        id: 'c7d1ce780fd042f0ad76deb958b7cb5c'
                        deleted: true
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_page'
                        id: '40ebb1d700c245f3a707144f51e7a9c0'
                        key: {
                            endpoint: 'x_589236_prprts_properties_viewer.do'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '99cde5a782694cfaa66c049fda39db1a'
                        key: {
                            application_file: 'f45a00cf60e040d3a37a07eaad726d1c'
                            source_artifact: 'ddb326ffb47e4e95b5d9a4f334af57bb'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'b9442d5e3e2543b49ee65e301e126179'
                        key: {
                            application_file: '40ebb1d700c245f3a707144f51e7a9c0'
                            source_artifact: 'ddb326ffb47e4e95b5d9a4f334af57bb'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'cc7350ef69bf4906803e5f82d90e14ae'
                        key: {
                            name: 'x_589236_prprts/main'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'cec3912fd78e492188f776c1fa069230'
                        key: {
                            application_file: 'cc7350ef69bf4906803e5f82d90e14ae'
                            source_artifact: 'ddb326ffb47e4e95b5d9a4f334af57bb'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'ddb326ffb47e4e95b5d9a4f334af57bb'
                        key: {
                            name: 'x_589236_prprts_properties_viewer.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'f45a00cf60e040d3a37a07eaad726d1c'
                        key: {
                            name: 'x_589236_prprts/main.js.map'
                        }
                    },
                ]
            }
        }
    }
}
