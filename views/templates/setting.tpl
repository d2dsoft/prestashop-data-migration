<div id="migration-page">
    <div class="page-header">
        <div class="current-title title">Settings</div>
        <div class="redirect-icon"><a href="{$form_url}" title="Migration"><span class="icon-migrate"></span></a></div>
    </div>

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

        <div id="setting-wrap" class="wrap-box">
            <form id="setting-form" action="{$form_url}&page_type=setting" method="POST" enctype="application/x-www-form-urlencoded">
                <input type="hidden" name="form_submit" value="1" />
                <input type="hidden" name="form_type" value="setting" />
                <div class="box-content">

                    <div class="mapping-table" style="margin-bottom: 20px;">

                        <div class="form-group odd">
                            <div class="form-label text-left">License Key</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="license" class="form-input" name="license" value="{$settings['license']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group even">
                            <div class="form-label text-left">Storage per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="storage" class="form-input" name="storage" value="{$settings['storage']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group odd">
                            <div class="form-label text-left">Tax per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="taxes" class="form-input" name="taxes" value="{$settings['taxes']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group even">
                            <div class="form-label text-left">Manufacturer per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="manufacturers" class="form-input" name="manufacturers" value="{$settings['manufacturers']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group odd">
                            <div class="form-label text-left">Category per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="categories" class="form-input" name="categories" value="{$settings['categories']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group even">
                            <div class="form-label text-left">Product per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="products" class="form-input" name="products" value="{$settings['products']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group odd">
                            <div class="form-label text-left">Customer per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="customers" class="form-input" name="customers" value="{$settings['customers']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group even">
                            <div class="form-label text-left">Order per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="orders" class="form-input" name="orders" value="{$settings['orders']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group odd">
                            <div class="form-label text-left">Review per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="reviews" class="form-input" name="reviews" value="{$settings['reviews']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group even">
                            <div class="form-label text-left">Delay time</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="delay" class="form-input" name="delay" value="{$settings['delay']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group odd">
                            <div class="form-label text-left">Retry time</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="retry" class="form-input" name="retry" value="{$settings['retry']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group even">
                            <div class="form-label text-left">Database source cart prefix</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="src_prefix" class="form-input" name="src_prefix" value="{$settings['src_prefix']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group odd">
                            <div class="form-label text-left">Database target cart prefix</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="target_prefix" class="form-input" name="target_prefix" value="{$settings['target_prefix']}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="form-group even">
                            <div class="form-label text-left">Other per batch</div>
                            <div class="form-field">
                                <div class="width50">
                                    <input type="text" id="other" class="form-input" name="other" value="{if isset($settings['other'])}{$settings['other']}{/if}"/>
                                </div>
                            </div>
                            <div class="clear-both"></div>
                        </div>

                        <div class="clear-both"></div>
                    </div>
                </div>
                <div class="box-action">
                    <div class="action-left">
                    </div>
                    <div class="action-center">
                        <a href="javascript: void(0)" class="next-action button-action action-submit">Save</a>
                    </div>
                    <div class="action-right">
                    </div>
                </div>
            </form>

        </div>

    </div>
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