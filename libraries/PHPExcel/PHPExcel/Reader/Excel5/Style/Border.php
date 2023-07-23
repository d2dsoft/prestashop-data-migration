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

class PHPExcel_Reader_Excel5_Style_Border
{
    protected static $map = array(
        0x00 => PHPExcel_Style_Border::BORDER_NONE,
        0x01 => PHPExcel_Style_Border::BORDER_THIN,
        0x02 => PHPExcel_Style_Border::BORDER_MEDIUM,
        0x03 => PHPExcel_Style_Border::BORDER_DASHED,
        0x04 => PHPExcel_Style_Border::BORDER_DOTTED,
        0x05 => PHPExcel_Style_Border::BORDER_THICK,
        0x06 => PHPExcel_Style_Border::BORDER_DOUBLE,
        0x07 => PHPExcel_Style_Border::BORDER_HAIR,
        0x08 => PHPExcel_Style_Border::BORDER_MEDIUMDASHED,
        0x09 => PHPExcel_Style_Border::BORDER_DASHDOT,
        0x0A => PHPExcel_Style_Border::BORDER_MEDIUMDASHDOT,
        0x0B => PHPExcel_Style_Border::BORDER_DASHDOTDOT,
        0x0C => PHPExcel_Style_Border::BORDER_MEDIUMDASHDOTDOT,
        0x0D => PHPExcel_Style_Border::BORDER_SLANTDASHDOT,
    );

    /**
     * Map border style
     * OpenOffice documentation: 2.5.11
     *
     * @param int $index
     * @return string
     */
    public static function lookup($index)
    {
        if (isset(self::$map[$index])) {
            return self::$map[$index];
        }
        return PHPExcel_Style_Border::BORDER_NONE;
    }
}