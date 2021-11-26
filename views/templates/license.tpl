<div id="migration-page">
    <div class="page-header">
        <div class="current-title title">Install</div>
    </div>

    <form id="module_form" class="defaultForm  form-horizontal" action="{$form_url}" method="POST" enctype="application/x-www-form-urlencoded">
        <input type="hidden" name="form_submit" value="1" />
        <input type="hidden" name="form_type" value="license" />
        <div class="migration-content">
            <div id="loading" class="backdrop">
                <span class="icon-loading"></span>
            </div>

            {if $messages}
                <div style="margin-bottom: 20px;">
                    {foreach from=$messages item="message"}
                        <div class="alert-box {$message['type']}"> {$message['message']}</div>
                    {/foreach}
                </div>
            {/if}

            <div id="install-wrap" class="wrap-box">

                <div class="box-content">

                    <div class="form-group width50" style="margin: 0 auto;">
                        <div style="width: 20%;float: left;">License</div>
                        <div style="width: 80%;float:left;">
                            <input type="text" class="form-input" name="license"/>
                        </div>
                        <div class="clear-both"></div>
                    </div>

                    <div class="form-group" style="margin-top: 10px;">
                        <p>Please fill your license in the form and click the "Install" button. The tool auto-downloads the newest library from D2dSoft's server and installs it. After that, you can run the migration.</p>
                        <p>If you don't have the license, please go to the <a href="https://d2d-soft.com/">D2dSoft website</a> to buy a license or try to run the free migration.</p>
                    </div>
                </div>
                <div class="box-action">
                    <div class="action-left"></div>
                    <div class="action-center">
                        <a href="javascript: void(0)" class="next-action button-action action-submit">Install</a>
                    </div>
                    <div class="action-right"></div>
                </div>
            </div>

        </div>
    </form>

</div>

<script type="text/javascript">
    var form_url = '{$form_url}';
</script>
{literal}
    <script type="text/javascript">
        $(document).ready(function(){
            $.MigrationData({
                url: form_url
            });
        });
    </script>
{/literal}