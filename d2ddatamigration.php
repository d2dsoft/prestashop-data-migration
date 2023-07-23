<?php

/**
 * D2dSoft
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL v3.0) that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL: https://d2d-soft.com/license/AFL.txt
 *
 * DISCLAIMER
 * Do not edit or add to this file if you wish to upgrade this extension/plugin/module to newer version in the future.
 *
 * @author     D2dSoft Developers <developer@d2d-soft.com>
 * @copyright  Copyright (c) 2021 D2dSoft (https://d2d-soft.com)
 * @license    https://d2d-soft.com/license/AFL.txt
 */

if (!defined('_PS_VERSION_')) exit;

class D2dDataMigration extends Module
{
    const PACKAGE_URL = 'https://d2d-soft.com/download_package.php';

    protected $migrationApp;

    protected $_html = '';

    /* @TODO: INIT */

    public function __construct()
    {
        $this->name = 'd2ddatamigration';
        $this->tab = 'migration_tools';
        $this->version = '1.0.0';
        $this->author = 'D2dSoft';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.6',
            'max' => _PS_VERSION_
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('D2dSoft Data Migration');
        $this->description = $this->l('Migration data to PrestaShop.');
        $this->confirmUninstall = $this->l('Are you sure you want to uninstall?');
    }

    /* @TODO: CONFIG */

    public function install()
    {
        return (parent::install()
            && $this->registerHook('actionAdminControllerSetMedia'));
    }

    public function uninstall()
    {
        return parent::uninstall();
    }

    public function getContent()
    {
        if (Tools::getValue('ajax')){
            return $this->processAjax();
        }
        if(Tools::isSubmit('form_submit')){
            $this->submitForm();
        }
        return $this->displayPage();
    }

    public function hookActionAdminControllerSetMedia()
    {
        /* @var $context ContextCore */
        $context = $this->context;
        $controller = $context->controller;
        $controller_class = get_class($controller);
        $config = Tools::getValue('configure');
        if($controller_class == 'AdminModulesController' && $config == 'd2ddatamigration'){
            $controller->addCSS($this->_path . 'assets/css/select2.min.css');
            $controller->addCSS($this->_path . 'assets/css/style.css');
            if(version_compare(_PS_VERSION_, '1.6.1.0', 'ge')){
                $controller->addCSS($this->_path . 'assets/css/custom161.css');
            } else {
                $controller->addCSS($this->_path . 'assets/css/custom.css');
            }
            $controller->addJquery();
            $controller->addJS($this->_path . 'assets/js/bootbox.min.js');
            $controller->addJS($this->_path . 'assets/js/jquery.form.min.js');
            $controller->addJS($this->_path . 'assets/js/select2.min.js');
            $controller->addJS($this->_path . 'assets/js/jquery.validate.min.js');
            $controller->addJS($this->_path . 'assets/js/jquery.extend.js');
            $controller->addJS($this->_path . 'assets/js/jquery.migration.js');
        }
    }

    /* @TODO: DISPLAY */

    protected function processAjax(){
        $action_type = $this->getArrayValue($_REQUEST, 'action_type', 'import');
        if($action_type == 'import'){
            $app = $this->getMigrationApp();
            $process = $this->getArrayValue($_REQUEST, 'process');
            if(!$process || !in_array($process, array(
                    D2dInit::PROCESS_SETUP,
                    D2dInit::PROCESS_CHANGE,
                    D2dInit::PROCESS_UPLOAD,
                    D2dInit::PROCESS_STORED,
                    D2dInit::PROCESS_STORAGE,
                    D2dInit::PROCESS_CONFIG,
                    D2dInit::PROCESS_CONFIRM,
                    D2dInit::PROCESS_PREPARE,
                    D2dInit::PROCESS_CLEAR,
                    D2dInit::PROCESS_IMPORT,
                    D2dInit::PROCESS_RESUME,
                    D2dInit::PROCESS_REFRESH,
                    D2dInit::PROCESS_AUTH,
                    D2dInit::PROCESS_FINISH))){
                $this->responseJson(array(
                    'status' => 'error',
                    'message' => 'Process Invalid.'
                ));
                return;
            }
            $response = $app->process($process);
            $this->responseJson($response);
        }
        if($action_type == 'download'){
            $app = $this->getMigrationApp();
            $app->process(D2dInit::PROCESS_DOWNLOAD);
            exit;
        }
        $this->responseJson(array(
            'status' => 'error',
            'message' => ''
        ));
        return;
    }

    protected function displayPage(){
        /* @var $context ContextCore */
        $context = $this->context;
        $page_type = Tools::getValue('page_type');
        if(!$this->isInstallLibrary()){
            $this->displayPageLicense();
            return $this->_html;
        }
        switch($page_type){
            case 'license':
                $this->displayPageLicense();
                break;
            case 'setting':
                $this->displayPageSetting();
                break;
            default:
                $this->displayPageMigration();
                break;
        }
        return $this->_html;
    }

    protected function submitForm(){
        $form_type = Tools::getValue('form_type');
        switch($form_type){
            case 'license':
                $this->submitFormLicense();
                break;
            case 'setting':
                $this->submitFormSetting();
                break;
            default:
                break;
        }
        return $this;
    }

    /* @TODO: PROCESS */

    protected function getCurrentUrl(){
        /* @var $context ContextCore */
        $context = $this->context;
        $form_url = $context->link->getAdminLink('AdminModules', false). '&configure='.$this->name.'&tab_module='.$this->tab.'&module_name='.$this->name . '&token=' .Tools::getAdminTokenLite('AdminModules');
        return $form_url;
    }

    protected function displayPageLicense(){
        $folder = $this->getLibraryFolder();
        if(!is_writeable($folder)){
            $folder_name = 'd2ddatamigration' . $this->getLibraryLocation();
            $this->setMessage('error', 'Folder "' . $folder_name . '" must is a writable folder.');
        }
        if(!ini_get('allow_url_fopen')){
            $this->setMessage('error', 'The PHP "allow_url_fopen" must is enabled. Please follow <a href="https://www.a2hosting.com/kb/developer-corner/php/using-php.ini-directives/php-allow-url-fopen-directive" target="_blank">here</a> to enable the setting.');
        }
        /* @var $context ContextCore */
        $context = $this->context;
        $form_url = $this->getCurrentUrl();
        $messages = $this->getMessage();
        $context->smarty->assign('form_url', $form_url);
        $context->smarty->assign('messages', $messages);
        $html = $this->display(__FILE__, '/views/templates/license.tpl');
        $this->_html .= $html;
        return $this;
    }

    protected function displayPageSetting(){
        /* @var $context ContextCore */
        $context = $this->context;
        $app = $this->getMigrationApp();
        $target = $app->getInitTarget();
        $settings = $target->dbSelectSettings();
        $messages = $this->getMessage();
        $form_url = $this->getCurrentUrl();
        $context->smarty->assign('form_url', $form_url);
        $context->smarty->assign('settings', $settings);
        $context->smarty->assign('messages', $messages);
        $html = $this->display(__FILE__, '/views/templates/setting.tpl');
        $this->_html .= $html;
        return $this;
    }

    protected function displayPageMigration(){
        /* @var $context ContextCore */
        $context = $this->context;
        $app = $this->getMigrationApp();
        $target = $app->getInitTarget();
        $response = $app->process(D2dInit::PROCESS_INIT);
        $html_content = '';
        if($response['status'] == D2dCoreLibConfig::STATUS_SUCCESS){
            $html_content = $response['html'];
        }
        $config = $target->getConfigJs();
        $config_data = $this->arrayToJsConfig($config);
        $form_url = $this->getCurrentUrl();
        $context->smarty->assign('html_content', $html_content);
        $context->smarty->assign('js_config', $config_data);
        $context->smarty->assign('form_url', $form_url);
        $html = $this->display(__FILE__, '/views/templates/migration.tpl');
        $this->_html .= $html;
        return $this;
    }

    protected function submitFormLicense(){
        $license = Tools::getValue('license');
        if(!$license){
            return;
        }
        $install = $this->downloadAndExtraLibrary($license);
        if(!$install){
            return;
        }
        if(!$this->isInstallLibrary()){
            return;
        }
        $app = $this->getMigrationApp();
        $initTarget = $app->getInitTarget();
        $install_db = $initTarget->setupDatabase($license);
        return true;
    }

    protected function submitFormSetting(){
        if(!$this->isInstallLibrary()){
            return;
        }
        $keys = array(
            'license', 'storage', 'taxes', 'manufacturers', 'customers', 'orders', 'reviews', 'delay', 'retry', 'src_prefix', 'target_prefix', 'other'
        );
        $app = $this->getMigrationApp();
        $target = $app->getInitTarget();
        foreach($keys as $key){
            $value = $this->getArrayValue($_POST, $key, '');
            $target->dbSaveSetting($key, $value);
        }
        $this->setMessage('success', 'Save successfully.');
        return true;
    }

    public function setMessage($type, $message){
        /* @var $context ContextCore */
        $context = $this->context;
        $messages = $context->cookie->migration_message;
        if($messages){
            $messages = json_decode($messages, 1);
        }
        if(!$messages){
            $messages = array();
        }
        $messages[] = array(
            'type' => $type,
            'message' => $message
        );
        $context->cookie->migration_message = json_encode($messages);
        return $this;
    }

    public function getMessage(){
        /* @var $context ContextCore */
        $context = $this->context;
        $messages = $context->cookie->migration_message;
        $context->cookie->migration_message = null;
        if($messages){
            $messages = json_decode($messages, 1);
        }
        return $messages;
    }

    /* @TODO: LIBRARY */

    protected function getLibraryLocation(){
        return '/tool';
    }

    protected function getLibraryFolder(){
        $location = $this->getLibraryLocation();
        $folder = dirname(__FILE__) . $location;
        return $folder;
    }

    protected function getInitLibrary(){
        $library_folder = $this->getLibraryFolder();
        return $library_folder . '/resources/init.php';
    }

    protected function isInstallLibrary(){
        $init_file = $this->getInitLibrary();
        return file_exists($init_file);
    }

    protected function downloadAndExtraLibrary($license = '')
    {
        $url = self::PACKAGE_URL;
        $library_folder = $this->getLibraryFolder();
        if(!is_dir($library_folder))
            @mkdir($library_folder, 0777, true);
        $tmp_path = $library_folder . '/resources.zip';
        $data = array(
            'license' => $license
        );
        $fp = @fopen($tmp_path, 'wb');
        if(!$fp){
            return false;
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0');
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_FAILONERROR, TRUE);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, TRUE);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
        curl_setopt($ch, CURLOPT_FILE, $fp);
        $response = curl_exec($ch);
        if(curl_errno($ch)){
            return false;
        }
        curl_close($ch);
        @fclose($fp);
        if(!$response){
            return false;
        }

        $zip = new ZipArchive;
        if ($zip->open($tmp_path) === TRUE) {
            $zip->extractTo($library_folder);
            $zip->close();

            @unlink($tmp_path);
            return true;
        } else {
            return false;
        }
    }

    protected function getMigrationApp()
    {
        if($this->migrationApp){
            return $this->migrationApp;
        }
        /* @var $context ContextCore */
        $context = $this->context;
        $user_id = $context->cookie->id_employee;;
        $library_folder = $this->getLibraryFolder();
        $library_location = str_replace(_PS_ROOT_DIR_, '', $library_folder);
        $library_location = str_replace('\\', '/', $library_location);
        $library_location = ltrim($library_location, '/');
        include_once $this->getInitLibrary();
        D2dInit::initEnv();
        $app = D2dInit::getAppInstance(D2dInit::APP_HTTP, D2dInit::TARGET_RAW, 'prestashop');
        $app->setRequest($_REQUEST);
        $config = array();
        $config['user_id'] = $user_id;
        $config['upload_dir'] = $library_folder . '/files';
        $config['upload_location'] = $library_location . '/files';
        $config['log_dir'] = $library_folder . '/log';
        $app->setConfig($config);
        $app->setPluginManager($this);
        $this->migrationApp = $app;
        return $this->migrationApp;
    }

    public function getPlugin($name){
        $path = dirname(__FILE__) . '/plugins/' . $name . '.php';
        if(!file_exists($path)){
            return false;
        }
        require_once $path;
        $class_name = 'D2dDataMigrationPlugin' . $name;
        if(!class_exists($class_name)){
            return false;
        }
        $class = new $class_name();
        return $class;
    }

    /* @TODO: UTILS */

    public function responseJson($data){
        echo json_encode($data);
        exit;
    }

    public function getArrayValue($array, $key, $default = null){
        return isset($array[$key]) ? $array[$key] : $default;
    }

    public function arrayToJsConfig($array){
        $data = array();
        foreach($array as $k => $v){
            $data[] = "'{$k}':'{$v}'";
        }
        $result = implode(',', $data);
        if($result){
            $result .= ',';
        }
        return $result;
    }
}