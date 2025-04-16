
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface FormResponsesProps {
  formId: string;
}

interface ResponseData {
  id: string;
  form_id: string;
  response: {
    questionId: string;
    value: string | string[];
  }[];
  created_at: string;
}

export const FormResponses: React.FC<FormResponsesProps> = ({ formId }) => {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId);
        
      if (error) throw error;
      
      setResponses(data || []);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to load responses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('form_responses_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'form_responses',
        filter: `form_id=eq.${formId}`
      }, (payload) => {
        setResponses(current => [...current, payload.new as ResponseData]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [formId]);

  const downloadCSV = () => {
    if (responses.length === 0) return;
    
    // Get all unique question IDs
    const allQuestionIds = new Set<string>();
    responses.forEach(response => {
      response.response.forEach(item => {
        allQuestionIds.add(item.questionId);
      });
    });
    
    // Create CSV header
    const headers = ['Response ID', 'Timestamp', ...Array.from(allQuestionIds)];
    
    // Create CSV rows
    const rows = responses.map(response => {
      const row: Record<string, string> = {
        'Response ID': response.id,
        'Timestamp': new Date(response.created_at).toLocaleString()
      };
      
      // Add question answers
      response.response.forEach(item => {
        row[item.questionId] = Array.isArray(item.value) 
          ? item.value.join(', ') 
          : item.value.toString();
      });
      
      return row;
    });
    
    // Convert to CSV string
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        return value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      });
      csv += values.join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `form-responses-${formId}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Form Responses</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchResponses}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCSV}
            disabled={responses.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading responses...' : 'No responses yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Response ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Answers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-mono text-xs">
                      {response.id}
                    </TableCell>
                    <TableCell>
                      {new Date(response.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <details className="cursor-pointer">
                        <summary className="text-sm text-blue-600 hover:text-blue-800">
                          View Answers
                        </summary>
                        <div className="mt-2 text-sm">
                          <ul className="space-y-1">
                            {response.response.map((item, index) => (
                              <li key={index} className="flex">
                                <span className="font-medium mr-2">{item.questionId}:</span>
                                <span>
                                  {Array.isArray(item.value) 
                                    ? item.value.join(', ') 
                                    : item.value.toString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};