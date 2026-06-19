/*!
 * Attach component v1.0
 *
 * @author Serge Galich <gaserge@mail.ru>
 * @copyright 2025
 * @license MIT
 * @website http://qujs.ru/attach/
 * 
 * @requires Qu
 */

(function(global) {
    'use strict';
    
    const LIB_NAME = 'Attach';
    const DATA_PREFIX = 'qu-attach';
    const QU_PREFIX = 'qu';

    if (global.Qu && global.Qu[LIB_NAME]) {
        global.Qu.debug(`⚠️ [${LIB_NAME}] Already registered, skipping duplicate`);
        return;
    }

    let Qu = null;
    let _initOnce = false;

    const _defaultConfig = {
        selector: 'attach',
        buttons: null,
        parallelUpload: true,

        enableCaptcha: false,
        captchaAction: 'upload_file',

        enableCaptchaForRemove: false,
        removeCaptchaAction: 'remove_file',

        maxFiles: 10,
        fileInputName: 'file',
        filesInputName: 'attach_field_name',
        addFormInputs: [],

        uploadUrl: 'upload.php',
        removeUrl: 'remove.php',

        fieldMap: {},
        trimFields: true,

        startPath: '/',

        urlTemplates: {
            file: '#startPath##folder#/#filename#',
            thumb: '#startPath##folder#/#thumb#',
            copyUrl: '#startPath##folder#/#filename#',
            copyImgUrl: '#startPath##folder#/#filename#',
        },
        
        lexicon: {
            maxFilesExceeded:  'Максимум %max% файлов',
            downloadError: 'Ошибка при загрузке',
            fileDeleted: 'Файл удален',
            deleteError: 'Ошибка удаления',
            uploadSuccess: 'Все файлы успешно загружены',
            urlCopied: 'URL к файлу скопирован в буфер',
            urlCopyManually: 'Скопируйте вручную:',
        }
    };

    function Constructor(params = {}) {
        this._config = Object.assign({}, _defaultConfig, params);
        this.files = [];
    };
    //Constructor._debug = false; // true by default
    Constructor.libName = LIB_NAME;

    // Универсальный метод для работы с data-атрибутами
    Constructor._setData = function(el, name, value, prefix = DATA_PREFIX) {
        const attrName = `data-${prefix}-${name}`;
        if (value === undefined) {
            el.setAttribute(attrName, '');
        } else {
            el.setAttribute(attrName, value);
        }
    };

    Constructor._getData = function(el, name, prefix = DATA_PREFIX) {
        if (!el || typeof el.getAttribute !== 'function') {
            return null;
        }
        return el.getAttribute(`data-${prefix}-${name}`);
    };

    Constructor._hasData = function(el, name, prefix = DATA_PREFIX) {
        if (!el || typeof el.hasAttribute !== 'function') {
            return false;
        }
        return el.hasAttribute(`data-${prefix}-${name}`);
    };

    Constructor._removeData = function(el, name, prefix = DATA_PREFIX) {
        el.removeAttribute(`data-${prefix}-${name}`);
    };

    // Вспомогательный метод для получения имени атрибута (для селекторов)
    Constructor._getDataAttrName = function(name, prefix = DATA_PREFIX) {
        return `data-${prefix}-${name}`;
    };

    Constructor._Qu = {

        debug: function(...args) {
            if (Qu && Qu.debug) return Qu.debug(...args);
            console.log(...args)
        },

        loading: function(state, el) {
            if (Qu && Qu.loading) return Qu.loading(state, el);
            if (el) el.style.opacity = state ? 0.5 : 1;
        },

        on: function(el, ev, handler, opts) {
            if (Qu && Qu.on) { return Qu.on(el, ev, handler, opts); }
            
            if (typeof ev !== 'string' && ev.addEventListener) {
                if (typeof el === 'string') {
                    el = el.split(' ').filter(e => e.trim());
                }

                el.forEach(el => {
                    ev.addEventListener(el.trim(), handler, opts);
                });
                return;
            }
            
            if (typeof ev === 'string') {
                if (typeof el === 'string') {
                    el = el.split(' ').filter(e => e.trim());
                }
                el.forEach(el => {
                    document.addEventListener(el.trim(), function(event) {
                        const target = event.target.closest(ev);
                        if (target) {
                            event._target = target;
                            handler(event);
                        }
                    }, opts);
                });
                
                return;
            }
        },

        dragScroll: function(container, options = {}) {
            if (Qu && Qu.dragScroll) {
                return Qu.dragScroll(container, options);
            }
            
        },

        dom: function() {
            if (Qu && Qu.dom) return Qu.dom();
            return Promise.resolve();
        },

        get Notifyer() {
            if (Qu && Qu.Notifyer) {
                return Qu.Notifyer;
            }

            return {
                success: function(message, options = {}) {
                    const title = options.title || '✅';
                    alert(title + '\n\n' + message);
                },
                error: function(message, options = {}) {
                    const title = options.title || '❌';
                    alert(title + '\n\n' + message);
                },
                info: function(message, options = {}) {
                    const title = options.title || 'ℹ️';
                    alert(title + '\n\n' + message);
                }
            }
        },

        get GreCaptcha() {
            if (Qu && Qu.GreCaptcha) {
                return Qu.GreCaptcha;
            }

            return null;
        },
    };

    
    Constructor.use = function (fn) {
        if (typeof fn === 'function') {
          fn(Constructor);
        }
    };

    Constructor.extend = function () {
        if (Array.isArray(global[LIB_NAME + 'Extend'])) {
          global[LIB_NAME + 'Extend'].forEach((fn) => {
            Constructor.use(fn);
          });
          global[LIB_NAME + 'Extend'] = [];
        }
    };

    Constructor.loaded = function(quInstance) {
        Qu = quInstance;
        Constructor.extend();
        Constructor.debug(`📗 [${LIB_NAME}] loaded`);
    };


    Constructor.debug = function(...args) {
        if (!Constructor._debug) return;
        Constructor._Qu.debug(...args);
    },

    Constructor.initOnce = function(params = {}) {
        if(_initOnce === true) return;
        _initOnce = true;
    };

    
    Constructor.init = function(quInstance, params = {}) {
         Qu = quInstance;
         
         Constructor.initOnce(params);
         Constructor.config(params);
         Constructor.debug(`⚙️ [${LIB_NAME}] init`, _defaultConfig);
     };

     Constructor.config = function(options) {
         Object.assign(_defaultConfig, options);
         return Constructor;
     };


     Constructor.prototype = {
        constructor: Constructor,

        use: function(fn) {
            if (typeof fn === 'function') {
                fn(this);
            }
        },
 
        test: function(){
             return 'test all';
        },

        init: function(container) {
            if (Constructor._hasData(container, 'inited')) {
                return this;
            }

           this.extendConfigFromData(container);

            this.container = container;
            this.form = container.closest('form');
            this.input = this.container.querySelector(`[${Constructor._getDataAttrName('input')}]`);
            this.dropzone = this.container.querySelector(`[${Constructor._getDataAttrName('dropzone')}]`);
            this.fileInput = this.container.querySelector(`[${Constructor._getDataAttrName('file-input')}]`);
            this.previews = this.container.querySelector(`[${Constructor._getDataAttrName('previews')}]`);
            this.templateEl = this.container.querySelector(`template[${Constructor._getDataAttrName('tpl')}]`);
            if (!this.templateEl) {
                Constructor.debug(`❌ [${LIB_NAME}] Template not found`);
            }

            this.bindEvents();
            this.loadExistingFiles();
            this.updateHiddenInput();

            container._attachInstance = this;
            Constructor._setData(container, 'inited', 'true');

            Constructor.debug(`🧩 [${LIB_NAME}] init `, {
                config: this._config,
                container: container,
            })
            return this;
        },

        extendConfigFromData: function(container) {

            const parentForm = container.closest('form');
            if (parentForm && Constructor._Qu.GreCaptcha && parentForm.hasAttribute(Constructor._Qu.GreCaptcha._config.selector)) {
                this._config.enableCaptcha = true;
            }

            for (let key in container.dataset) {
                if (key.startsWith('quAttach')) {
                    let configKey = key.slice(8);
                    configKey = configKey.charAt(0).toLowerCase() + configKey.slice(1);
                    
                    let value = container.dataset[key];
        
                    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            // не JSON, оставляем как есть
                        }
                    } else if (value === 'true') {
                        value = true;
                    } else if (value === 'false') {
                        value = false;
                    } 
        
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        this._config[configKey] = {
                            ...this._config[configKey],
                            ...value
                        };
                    } else {
                        this._config[configKey] = value;
                    }
                }
            }
        },

        getAllFieldsFromMap: function() {
            const fields = new Set();
            
            Object.keys(this._config.fieldMap || {}).forEach(field => {
                fields.add(field);
            });
            
            return Array.from(fields);
        },

        convertData: function(data, direction = 'local') {
            const map = this._config.fieldMap || {};
            const result = {};
            
            if (direction === 'local') {
                const reverseMap = {};
                for (let [localField, serverField] of Object.entries(map)) {
                    reverseMap[serverField] = localField;
                }
                
                for (let [key, value] of Object.entries(data)) {
                    if (reverseMap[key]) {
                        result[reverseMap[key]] = value;
                    } else {
                        result[key] = value;
                    }
                }
            } else {
                for (let [key, value] of Object.entries(data)) {
                    if (map[key]) {
                        result[map[key]] = value;
                    } else {
                        result[key] = value;
                    }
                }
            }
            
            return result;
        },

        updateHiddenInput() {
            const serverData = this.files.map(file => this.convertData(file, 'server'));
            this.input.value = JSON.stringify(serverData);
        },

         bindEvents: function() {

            this.dropzone.addEventListener('click', (e) => {
                if (e.target.closest(`[${Constructor._getDataAttrName('previews')}]`) || 
                    e.target.closest(`[${Constructor._getDataAttrName('tpl-el')}]`)) {
                    return;
                }

                this.fileInput.click();
            });
            
            this.fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
            
            this.dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.dropzone.classList.add('dragover');
            });
            
            this.dropzone.addEventListener('dragleave', () => {
                this.dropzone.classList.remove('dragover');
            });
            
            this.dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.dropzone.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });

            if (Constructor._getData(this.container, 'mode') === 'horizontal') {
                Constructor._Qu.dragScroll(this.previews, {
                    exclude: 'button, a, input, [data-qu-attach-field]',
                    speed: 1.5
                });
            }
        },

        handleFiles(fileList) {
            const files = Array.from(fileList);
            let _this = this;
            
            if (this.files.length + files.length > this._config.maxFiles) {
                const msg = this._config.lexicon.maxFilesExceeded.replace('%max%', this._config.maxFiles);
                Constructor._Qu.Notifyer.error(msg);
                return;
            }
        
            Constructor._Qu.loading(true, this.container);
        
            if (this._config.parallelUpload) {
                const uploadPromises = files.map(file => this.uploadFile(file));
                
                Promise.all(uploadPromises)
                    .then(() => {
                        Constructor.debug(`✅ [${LIB_NAME}] All files uploaded in parallel`);
                    })
                    .catch(error => {
                        Constructor._Qu.Notifyer.error(_this._config.lexicon.downloadError);
                        console.error(error);
                    })
                    .finally(() => {
                        Constructor._Qu.loading(false, this.container);
                    });
            } else {
                this.uploadFilesSequentially(files);
            }
        },
        
        async uploadFilesSequentially(files) {
            let hasError = false;
            let _this = this;
            
            for (let i = 0; i < files.length; i++) {
                try {
                    Constructor.debug(`⏳ [${LIB_NAME}] Uploading file ${i + 1} of ${files.length}`);
                    await this.uploadFile(files[i]);
                } catch (error) {
                    hasError = true;
                    Constructor._Qu.Notifyer.error(_this._config.lexicon.downloadError + ' ' + files[i].name);
                    console.error(error);
                }
            }
            
            if (!hasError) {
                Constructor._Qu.Notifyer.success(_this._config.lexicon.uploadSuccess);
            }

            Constructor.debug(`✅ [${LIB_NAME}] files uploaded in sequentially`);
            
            Constructor._Qu.loading(false, this.container);
        },

        additionalInputs(formData){
            this._config.addFormInputs.forEach(item => {
                if (typeof item === 'object') {
                    const inputName = Object.keys(item)[0];
                    const fieldName = item[inputName];
                    const input = this.form.querySelector(`[name="${inputName}"]`);
                    if(input) {
                        formData.append(fieldName, input.value || '');
                    } else {
                        Constructor.debug(`❌ [${LIB_NAME}]`, `input with name="${inputName}" in form not found...`, { form: this.form });
                    }
                } else {
                    const input = this.form.querySelector(`[name="${item}"]`);
                    if(input) {
                        formData.append(item, input.value || '');
                    } else {
                        Constructor.debug(`❌ [${LIB_NAME}]`, `input with name="${item}" in form not found...`, { form: this.form });
                    }
                }
            });

            return formData;
        },

        async getCaptchaToken(_action) {
            const greCaptcha = Constructor._Qu.GreCaptcha;
            
            const parentForm = this.container.closest('form');

            if (
                greCaptcha &&
                greCaptcha._config.enabled &&
                greCaptcha._config.siteKey !== '' &&
                parentForm.hasAttribute(greCaptcha._config.selector)
            ) {
                try {
                    const action = _action || 'upload_file';
                    const token = await greCaptcha.check(action);
                    
                    return token;
                } catch (error) {
                    console.error(`❌ [${LIB_NAME}] Captcha error:`, error);
                    throw new Error('Captcha error');
                }
            }
            
            return null;
        },


        async uploadFile(file) {
            Constructor._Qu.loading(true, this.container);
            let _this = this;
            
            try {
                const token = await this.getCaptchaToken(this._config.captchaAction);
                
                const formData = new FormData();
                formData.append(this._config.fileInputName, file);
                formData.append(this._config.filesInputName, this.input.name);
                
                if (token) {
                    formData.append(Constructor._Qu.GreCaptcha?._config?.tokenInput || 'g-recaptcha-response', token);
                    Constructor.debug(`🔑 [${LIB_NAME}] Adding captcha token to upload request`);
                }
                
                this.additionalInputs(formData);
                
                const response = await fetch(this._config.uploadUrl, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                Constructor.debug(`🚀 [${LIB_NAME}] upload fetch data`, {
                    data: result,
                    file: file,
                    this: this,
                })
                
                if (result.success) {

                    const localData = this.convertData(result.data, 'local');
                    const mapFields = this.getAllFieldsFromMap();

                    const defaultFields = {};
                    mapFields.forEach(field => {
                        defaultFields[field] = '';
                    });
                    
                    const fileData = {
                        ...defaultFields,
                        ...localData,
                        id: this.generateId(),
                    };
                    
                    this.files.push(fileData);

                    if (this.templateEl) {
                        const preview = this.renderTemplate(fileData);
                        this.attachPreviewEvents(preview, fileData);
                        this.previews.appendChild(preview);
                        this.updateMoveButtons();
                    }

                    this.updateHiddenInput();

                    Constructor._Qu.Notifyer.success(result.message);
                } else {
                    Constructor._Qu.Notifyer.error(result.data?.message || result.message || _this._config.lexicon.downloadError + ' ' + file.name);
                }
                
            } catch (error) {
                Constructor._Qu.Notifyer.error(_this._config.lexicon.downloadError);
                console.error(error)
                throw error;
            } finally {
                Constructor._Qu.loading(false, this.container);
            }
        },

        loadExistingFiles: function() {
            try {
                if (this.input && this.input.value) {
                    const files = JSON.parse(this.input.value);
                    if (Array.isArray(files) && files.length) {
                        const mapFields = this.getAllFieldsFromMap();

                        this.files = files.map(file => {
                            const localFile = this.convertData(file, 'local');
                            mapFields.forEach(field => {
                                if (!localFile.hasOwnProperty(field)) {
                                    localFile[field] = '';
                                }
                            });
                            
                            return localFile;
                        });

                        this.renderAllPreviews();
                    }
                }
            } catch (e) {
                console.warn('Error loading existing files', e);
            }
        },

        renderAllPreviews: function() {
            if (!this.previews) return;
            
            this.previews.innerHTML = '';
            
            if (!this.templateEl) {
                this.files.forEach(file => {
                    const div = document.createElement('div');
                    div.textContent = file.filename || file.originalName || 'File';
                    this.previews.appendChild(div);
                });
                return;
            }
            
            this.files.forEach(file => {
                const preview = this.renderTemplate(file);
                this.attachPreviewEvents(preview, file);
                this.previews.appendChild(preview);
            });

            this.updateMoveButtons();
        },

        attachPreviewEvents: function(preview, file) {
            const removeBtn = preview.querySelector(`[${Constructor._getDataAttrName('tpl-remove')}]`);
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.removeFile(file);
                });
            }
            
            const upBtn = preview.querySelector(`[${Constructor._getDataAttrName('tpl-up')}]`);
            if (upBtn) {
                upBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.moveFileUp(file.id);
                });
            }
            
            const downBtn = preview.querySelector(`[${Constructor._getDataAttrName('tpl-down')}]`);
            if (downBtn) {
                downBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.moveFileDown(file.id);
                });
            }
            
            const copyBtn = preview.querySelector(`[${Constructor._getDataAttrName('tpl-copy')}]`);
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.copyUrl(file);
                });
            }
        },

        buildUrl: function(file, type = 'file') {
            const template = this._config.urlTemplates[type] || this._config.urlTemplate;

            return template
                .replace(/#startPath#/g, this._config.startPath)
                .replace(/#folder#/g, file.folder || '')
                .replace(/#filename#/g, file.filename || '')
                .replace(/#thumb#/g, file.thumb || '')
                .replace(/#caption#/g, file.caption || '')
                .replace(/#ext#/g, file.ext || '');
        },

        copyUrl: function(file) {
            let url;
            let _this = this;

            if(file.thumb === false || file.thumb == '') {
                url = this.buildUrl(file, 'copyUrl');
            } else {
                url = this.buildUrl(file, 'copyImgUrl');
            }
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function() {
                    Constructor._Qu.Notifyer.success(_this._config.lexicon.urlCopied); 
                }).catch(() => {
                    prompt(_this._config.lexicon.urlCopyManually, url);
                });
            } else {
                prompt(_this._config.lexicon.urlCopyManually, url);
            }
        },

        moveFileUp: function(id) {
            this.previews.classList.add('is-moving');
            const index = this.files.findIndex(f => f.id == id);
            if (index > 0) {
                [this.files[index - 1], this.files[index]] = [this.files[index], this.files[index - 1]];
                
                this.updateHiddenInput();
                
                const items = this.previews.children;
                if (items.length > index) {
                    if (index - 1 >= 0) {
                        this.previews.insertBefore(items[index], items[index - 1]);
                    }
                }

                this.updateMoveButtons();
            }
            setTimeout(() => {
               this.previews.classList.remove('is-moving');
            }, 100);
        },
        
        moveFileDown: function(id) {
            this.previews.classList.add('is-moving');
            const index = this.files.findIndex(f => f.id == id);
            if (index < this.files.length - 1) {
                [this.files[index], this.files[index + 1]] = [this.files[index + 1], this.files[index]];
                
                this.updateHiddenInput();
                
                const items = this.previews.children;
                if (items.length > index + 1) {
                    this.previews.insertBefore(items[index + 1], items[index]);
                }

                this.updateMoveButtons();
            }
            setTimeout(() => {
                this.previews.classList.remove('is-moving');
            }, 100);
        },

        updateMoveButtons: function() {
            const items = this.previews.children;
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const upBtn = item.querySelector(`[${Constructor._getDataAttrName('tpl-up')}]`);
                const downBtn = item.querySelector(`[${Constructor._getDataAttrName('tpl-down')}]`);
                
                if (upBtn) {
                    upBtn.style.display = i === 0 ? 'none' : '';
                }
                if (downBtn) {
                    downBtn.style.display = i === items.length - 1 ? 'none' : '';
                }
            }
        },

        attachInputListener: function(input, fileId, field) {
            input.addEventListener('input', (e) => {
                const fileIndex = this.files.findIndex(f => f.id == fileId);
                if (fileIndex !== -1) {
                    this.files[fileIndex][field] = e.target.value;
                    this.updateHiddenInput();
                }
            });
            
            input.addEventListener('change', (e) => {
                const fileIndex = this.files.findIndex(f => f.id == fileId);
                if (fileIndex !== -1) {
                    this.files[fileIndex][field] = e.target.value;
                    this.updateHiddenInput();
                }
            });
        },

        async isCaptchaRequiredForRemove() {
            if (!this._config.enableCaptcha || !this._config.enableCaptchaForRemove) {
                return false;
            }
            
            return true;
        },

        removeFile: async function(file) {
            const fileForServer = this.convertData(file, 'server');
            let _this = this;

            Constructor._Qu.loading(true, this.container);

            try {
                const formData = new FormData();
                formData.append('file_id', fileForServer.id || file.id);
                formData.append('filename', file.filename);
                formData.append('caption', file.caption);
                formData.append(this._config.filesInputName, this.input.name);
                
                this.additionalInputs(formData);

                const needCaptcha = await this.isCaptchaRequiredForRemove();
                if (needCaptcha) {
                    const token = await this.getCaptchaToken(this._config.removeCaptchaAction);
                    
                    if (token) {
                        formData.append(Constructor._Qu.GreCaptcha?._config?.tokenInput || 'g-recaptcha-response', token);
                        Constructor.debug(`🔑 [${LIB_NAME}] Adding captcha token to remove request`);
                    } else {
                        Constructor.debug(`⚠️ [${LIB_NAME}] Captcha required but no token received`);
                    }
                }
                
                const response = await fetch(this._config.removeUrl, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();

                
                Constructor.debug(`🚀 [${LIB_NAME}] remove fetch data`, {
                    data: result,
                    file: file,
                    this: this,
                })

                Constructor._Qu.loading(false, this.container);
                
                if (result.success) {
                    this.files = this.files.filter(f => f.id != file.id);
                    this.updateHiddenInput();
                    this.renderAllPreviews();
                    Constructor._Qu.Notifyer.success(result.message || _this._config.lexicon.fileDeleted);
                } else {
                    Constructor._Qu.Notifyer.error(result.message || _this._config.lexicon.deleteError);
                }
            } catch (error) {
                Constructor._Qu.Notifyer.error(`Network error: ${error.message}`);
                Constructor._Qu.loading(false, this.container);
            }
        },

        renderTemplate: function(file) {
            const clone = document.importNode(this.templateEl.content, true);
            
            const rootEl = clone.querySelector(`[${Constructor._getDataAttrName('tpl-el')}]`);
            if (rootEl) {
                Constructor._setData(rootEl, 'id', file.id);
            }
        
            const mapFields = this.getAllFieldsFromMap();
            
            clone.querySelectorAll(`[${Constructor._getDataAttrName('field')}]`).forEach(el => {
                const field = Constructor._getData(el, 'field');
                if (mapFields.includes(field) && !file.hasOwnProperty(field)) {
                    file[field] = '';
                }
        
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                    el.value = file[field] !== undefined ? file[field] : '';
                    this.attachInputListener(el, file.id, field);
                } else {
                    el.textContent = file[field] !== undefined ? file[field] : '';
                }
            });
            
            const preview = clone.querySelector(`[${Constructor._getDataAttrName('thumb-field')}]`);
            if (preview && file.thumb !== false && file.thumb !== '') {
                const imgUrl = this.buildUrl(file, 'thumb');
                preview.innerHTML = `<img src="${imgUrl}" alt="" loading="lazy">`;
            } else {
                preview.innerHTML = `<span>${file.ext || '📄'}</span>`;
            }
            
            return clone;
        },

        generateId: function() {
            let maxId = 0;
            
            this.files.forEach(file => {
                const id = file.id;
                if (id) {
                    const numId = parseInt(id, 10);
                    if (!isNaN(numId) && numId > maxId) {
                        maxId = numId;
                    }
                }
            });
            
            return (maxId + 1).toString();
        },
    };
    

    if (global.Qu) {
        global.Qu.lib(LIB_NAME, Constructor);
    } else {
        global._QuLibs = global._QuLibs || [];
        global._QuLibs.push({ name: LIB_NAME, instance: Constructor });
    }

})(typeof window !== 'undefined' ? window : global);