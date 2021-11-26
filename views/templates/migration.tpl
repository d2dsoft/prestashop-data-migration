<div id="migration-page">
    <div class="page-header">
        <div class="current-title title">Migration</div>
        <div class="redirect-icon"><a href="{$form_url}&page_type=setting" title="Setting"><span class="icon-setting"></span></a></div>
    </div>
    {$html_content}
</div>
<script type="text/javascript">
    var migrationConfig = {ldelim}
        {$js_config}
        url: '{$form_url}',
        request_post: {ldelim}action_type: 'import', ajax: 1 {rdelim},
        request_download: {ldelim}action_type: 'download',ajax: 1{rdelim}
    {rdelim};
</script>
{literal}
    <script type="text/javascript">
        $(document).ready(function(){
            $.MigrationData(migrationConfig);
        });
    </script>
{/literal}