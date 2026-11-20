<?php

namespace Tests\Unit;

use App\Services\CsvExporter;
use PHPUnit\Framework\TestCase;

class CsvExporterTest extends TestCase
{
    public function test_it_quotes_only_values_that_need_it(): void
    {
        $this->assertSame('Alice', CsvExporter::escape('Alice'));
        $this->assertSame('"Smith, Alice"', CsvExporter::escape('Smith, Alice'));
        $this->assertSame('"He said ""hi"""', CsvExporter::escape('He said "hi"'));
    }

    public function test_it_builds_a_crlf_csv_with_a_header_row(): void
    {
        $csv = CsvExporter::build([
            ['date' => '2026-11-18T09:00:00Z', 'staffName' => 'Alice', 'status' => 'OUT'],
        ]);

        $this->assertStringStartsWith("Date,Staff,Email,Department,Clock in,Clock out,Hours,Status\r\n", $csv);
        $this->assertStringContainsString(',Alice,', $csv);
        $this->assertStringEndsWith("\r\n", $csv);
    }

    public function test_it_adds_a_utf8_bom_and_download_headers(): void
    {
        $response = CsvExporter::response([], 'attendance-export');

        $this->assertSame(200, $response->getStatusCode());
        $this->assertStringStartsWith("\xEF\xBB\xBF", $response->getContent());
        $this->assertStringContainsString('attachment; filename="attendance-export.csv"', $response->headers->get('Content-Disposition'));
    }
}
