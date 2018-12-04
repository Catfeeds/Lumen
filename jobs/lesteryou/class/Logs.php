<?php

class Logs
{
    /**
     * @var string $filePath log文件的完整路径(包含文件名称)
     * @var string $filename log文件的名称(默认是当前完整日期，比如'2017-10-10.log')
     * @var int $fileSize 单个log文件大小的最大值
     * @var string $handle 句柄
     * @var string $path log文件的相对路径("/../../data/logs/)
     */
    private $filePath;
    private $filename;
    private $fileSize;
    private $handle;
    private $path;

    /**
     * Logs constructor.
     * @param null $fname
     * @param int $fsize
     */
    public function __construct($fname = null, $fsize = 10485760)
    {
        //初始化
        $this->filename = empty($fname) ? date('Y-m-d') : $fname;
        $this->path = __DIR__ . "/../data/logs/";
        $this->filePath = $this->path . $this->filename . '.log';
        $this->fileSize = $fsize;
    }

    private function checkFile()
    {
        if (!file_exists($this->filePath)) {
            $this->handle = fopen($this->filePath, "a");
        } else {
            $size = filesize($this->filePath);
            if ($size > $this->fileSize) {
                $i = 1;
                $newName = $this->path . $this->filename . "_" . $i . ".log";
                while (file_exists($newName)) {
                    $i++;
                    $newName = $this->path . $this->filename . "_" . $i . ".log";
                }
                rename($this->filePath, $newName);
                $this->handle = fopen($this->filePath, "a");
            } else {
                $this->handle = fopen($this->filePath, "a");
            }
        }
        if ($this->handle) {
            return true;
        }
        return false;
    }

    public function Write($msg)
    {
        if ($this->checkFile()) {
            flock($this->handle, LOCK_EX);
            fwrite($this->handle, "[Logs]：" . strftime("%Y-%m-%d %H:%M:%S", time()) . "\n" . $msg . "\n");
            flock($this->handle, LOCK_UN);
        }
    }

    public function error($msg)
    {
        $this->Write($msg);
    }

    function __destruct()
    {
        // TODO: Implement __destruct() method.
        if ($this->handle) {
            fclose($this->handle);
        }
    }

}
