
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FormEditor } from './FormBuilder/FormEditor';
import { FormPreview } from './FormBuilder/FormPreview';
import { EmbedCodeGenerator } from './FormBuilder/EmbedCodeGenerator';
import { FormResponses } from './FormBuilder/FormResponses';
import { FormQuestion } from '../types/form';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Save, Eye, Code, BarChart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FormBuilder = () => {
  const [formId] = useState(() => crypto.randomUUID());
  const [formTitle, setFormTitle] = useState('My Awesome Form');
  const [formDescription, setFormDescription] = useState('Please answer the following questions');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [saving, setSaving] = useState(false);

  // Load form data if it exists
  useEffect(() => {
    const loadForm = async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error loading form:', error);
        }
        return;
      }
      
      if (data) {
        setFormTitle(data.title);
        setFormDescription(data.description || '');
        setQuestions(data.questions || []);
        setPrimaryColor(data.theme?.primaryColor || '#6366f1');
        setSecondaryColor(data.theme?.secondaryColor || '#8b5cf6');
      }
    };
    
    // Create the forms table if it doesn't exist
    const createFormsTable = async () => {
      const { error } = await supabase.rpc('create_forms_table_if_not_exists');
      if (error) {
        console.error('Error creating forms table:', error);
      }
    };
    
    createFormsTable().then(() => loadForm());
  }, [formId]);

  const saveForm = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('forms')
        .upsert({
          id: formId,
          title: formTitle,
          description: formDescription,
          questions,
          theme: {
            primaryColor,
            secondaryColor,
            fontColor: '#ffffff',
            backgroundColor: '#000000'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('Form saved successfully!');
    } catch (err) {
      console.error('Error saving form:', err);
      toast.error('Failed to save form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = async (answers: { questionId: string; value: string | string[] }[]) => {
    try {
      const { error } = await supabase
        .from('form_responses')
        .insert([{ 
          form_id: formId, 
          response: answers 
        }]);
        
      if (error) throw error;
      
      toast.success('Form submitted successfully!');
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">Typeform-style Form Builder</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="primary-color" className="text-sm text-gray-600">Primary</label>
                <input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="secondary-color" className="text-sm text-gray-600">Secondary</label>
                <input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
                />
              </div>
              <Button onClick={saveForm} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Form'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 w-full justify-start">
            <TabsTrigger value="editor" className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              Responses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-0">
            <FormEditor
              questions={questions}
              setQuestions={setQuestions}
              formTitle={formTitle}
              setFormTitle={setFormTitle}
              formDescription={formDescription}
              setFormDescription={setFormDescription}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="border rounded-lg overflow-hidden h-[calc(100vh-200px)]">
              <FormPreview
                questions={questions}
                formTitle={formTitle}
                formDescription={formDescription}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onSubmit={handleFormSubmit}
              />
            </div>
          </TabsContent>

          <TabsContent value="embed" className="mt-0">
            <EmbedCodeGenerator formId={formId} />
          </TabsContent>

          <TabsContent value="responses" className="mt-0">
            <FormResponses formId={formId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FormBuilder;