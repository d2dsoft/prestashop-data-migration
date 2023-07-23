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

class PHPExcel_Reader_Excel5_Style_FillPattern
{
    protected static $map = array(
        0x00 => PHPExcel_Style_Fill::FILL_NONE,
        0x01 => PHPExcel_Style_Fill::FILL_SOLID,
        0x02 => PHPExcel_Style_Fill::FILL_PATTERN_MEDIUMGRAY,
        0x03 => PHPExcel_Style_Fill::FILL_PATTERN_DARKGRAY,
        0x04 => PHPExcel_Style_Fill::FILL_PATTERN_LIGHTGRAY,
        0x05 => PHPExcel_Style_Fill::FILL_PATTERN_DARKHORIZONTAL,
        0x06 => PHPExcel_Style_Fill::FILL_PATTERN_DARKVERTICAL,
        0x07 => PHPExcel_Style_Fill::FILL_PATTERN_DARKDOWN,
        0x08 => PHPExcel_Style_Fill::FILL_PATTERN_DARKUP,
        0x09 => PHPExcel_Style_Fill::FILL_PATTERN_DARKGRID,
        0x0A => PHPExcel_Style_Fill::FILL_PATTERN_DARKTRELLIS,
        0x0B => PHPExcel_Style_Fill::FILL_PATTERN_LIGHTHORIZONTAL,
        0x0C => PHPExcel_Style_Fill::FILL_PATTERN_LIGHTVERTICAL,
        0x0D => PHPExcel_Style_Fill::FILL_PATTERN_LIGHTDOWN,
        0x0E => PHPExcel_Style_Fill::FILL_PATTERN_LIGHTUP,
        0x0F => PHPExcel_Style_Fill::FILL_PATTERN_LIGHTGRID,
        0x10 => PHPExcel_Style_Fill::FILL_PATTERN_LIGHTTRELLIS,
        0x11 => PHPExcel_Style_Fill::FILL_PATTERN_GRAY125,
        0x12 => PHPExcel_Style_Fill::FILL_PATTERN_GRAY0625,
    );

    /**
     * Get fill pattern from index
     * OpenOffice documentation: 2.5.12
     *
     * @param int $index
     * @return string
     */
    public static function lookup($index)
    {
        if (isset(self::$map[$index])) {
            return self::$map[$index];
        }
        return PHPExcel_Style_Fill::FILL_NONE;
    }
}