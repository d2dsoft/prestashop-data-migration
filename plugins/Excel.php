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

class D2dDataMigrationPluginExcel
{
    public function readFile($file_path, $start, $limit = 10, $total = false, $lower_key = false, $sheet_index = 0){
        if(class_exists('\\PhpOffice\\PhpSpreadsheet\\Spreadsheet')){
            return $this->readFileBySpreadsheet($file_path, $start, $limit, $total, $lower_key, $sheet_index);
        }
        return $this->readFileByPHPExcel($file_path, $start, $limit, $total, $lower_key, $sheet_index);
    }

    public function readFileByPHPExcel($file_path, $start, $limit = 10, $total = false, $lower_key = false, $sheet_index = 0){
        if(!is_file($file_path)){
            return array(
                'status' => 'error',
                'message' => 'The file is not exist'
            );
        }
        try{
            if(!class_exists('PHPExcel')){
                require_once dirname(__FILE__) . '/../libraries/PHPExcel/PHPExcel.php';
            }
            /* @var $excelReader PHPExcel_Reader_Excel2007 */
            $excelReader = PHPExcel_IOFactory::createReaderForFile($file_path);
            $objPHPExcel = $excelReader->load($file_path);
            /* @var $worksheet PHPExcel_Worksheet */
            $sheet = $objPHPExcel->getSheet($sheet_index);
            $highestRow = $sheet->getHighestRow();
            $highestColumn = $sheet->getHighestColumn();
            $finish = false;
            $count = 0;
            $end = $start + $limit;
            $headers = array();
            $data = array();
            for ($row = 1; $row <= $highestRow; $row++){
                if($total && $count > $total){
                    $finish = true;
                    break ;
                }
                if($count > $end){
                    break ;
                }
                if ($count == 0 || ($start < $count && $count <= $end)) {
                    $rowData = $sheet->rangeToArray('A' . $row . ':' . $highestColumn . $row,
                        NULL,
                        TRUE,
                        FALSE);
                    $rowData = $rowData[0];
                    if($count == 0){
                        $headers = $rowData;
                        if($lower_key){
                            $headers = array_map('strtolower', $headers);
                        }
                    } else {
                        $data[] = $this->buildItem($headers, $rowData);
                    }
                }
                $count++;
            }
            if(!$finish && ($count - 1) < $end){
                $finish = true;
            }
            return array(
                'status' => 'success',
                'headers' => $headers,
                'data' => $data,
                'count' => $end,
                'finish' => $finish
            );
        } catch (Exception $e){
            return array(
                'status' => 'error',
                'message' => $e->getMessage()
            );
        }
    }

    public function readFileBySpreadsheet($file_path, $start, $limit = 10, $total = false, $lower_key = false, $sheet_index = 0){
        if(!is_file($file_path)){
            return array(
                'status' => 'error',
                'message' => 'The file is not exist'
            );
        }
        try {
            $class_name = '\\PhpOffice\\PhpSpreadsheet\\IOFactory';
            /* @var $excelReader \PhpOffice\PhpSpreadsheet\Reader\Xlsx */
            $excelReader = $class_name::createReaderForFile($file_path);
            $spreadsheet = $excelReader->load($file_path);
            /* @var $sheet \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet */
            $sheet = $spreadsheet->getSheet($sheet_index);
            $highestRow = $sheet->getHighestRow();
            $highestColumn = $sheet->getHighestColumn();
            $finish = false;
            $count = 0;
            $end = $start + $limit;
            $headers = array();
            $data = array();
            for ($row = 1; $row <= $highestRow; $row++){
                if($total && $count > $total){
                    $finish = true;
                    break ;
                }
                if($count > $end){
                    break ;
                }
                if ($count == 0 || ($start < $count && $count <= $end)) {
                    $rowData = $sheet->rangeToArray('A' . $row . ':' . $highestColumn . $row,
                        NULL,
                        TRUE,
                        FALSE);
                    $rowData = $rowData[0];
                    if($count == 0){
                        $headers = $rowData;
                        if($lower_key){
                            $headers = array_map('strtolower', $headers);
                        }
                    } else {
                        $data[] = $this->buildItem($headers, $rowData);
                    }
                }
                $count++;
            }
            if(!$finish && ($count - 1) < $end){
                $finish = true;
            }
            return array(
                'status' => 'success',
                'headers' => $headers,
                'data' => $data,
                'count' => $end,
                'finish' => $finish
            );
        } catch (Exception $e){
            return array(
                'status' => 'error',
                'message' => $e->getMessage()
            );
        }
    }

    protected function buildColumnIndex($max_column){
        $start = 'A';
        $position = 0;
        $run = true;
        $data = array(
            $start => $position,
        );
        if($start == $max_column){
            return $data;
        }
        while($run){
            $start++;
            $position++;
            $data[$start] = $position;
            if($start == $max_column){
                $run = false;
            }
        }
        return $data;
    }

    protected function buildItem($headers, $row){
        if(!$row){
            return array();
        }
        $row_value = array_filter($row);
        if(!$row_value || empty($row_value)){
            return array();
        }
        $data = array();
        foreach ($headers as $key => $title_name){
            $data[$title_name] = (isset($row[$key]))? $row[$key] : null;
        }
        return $data;
    }
}