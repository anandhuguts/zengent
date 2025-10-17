import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Code, AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DemographicField {
  category: string;
  fieldName: string;
  description: string;
  examples: string[];
  patternCount: number;
  isCustom?: boolean;
}

interface CustomPattern {
  id?: number;
  category: string;
  fieldName: string;
  patterns: string[];
  description: string;
  examples: string[];
}

export default function DemographicPatternsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch built-in patterns
  const { data: patternsData, isLoading } = useQuery({
    queryKey: ['/api/demographic/patterns'],
  });

  // Fetch custom patterns
  const { data: customPatternsData } = useQuery({
    queryKey: ['/api/demographic/custom-patterns'],
  });

  const [newPattern, setNewPattern] = useState<CustomPattern>({
    category: 'Name',
    fieldName: '',
    patterns: [''],
    description: '',
    examples: ['']
  });

  // Add custom pattern mutation
  const addPatternMutation = useMutation({
    mutationFn: async (pattern: CustomPattern) => {
      return await apiRequest('/api/demographic/custom-patterns', 'POST', pattern);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/demographic/custom-patterns'] });
      toast({
        title: "Pattern Added",
        description: "Custom demographic pattern has been added successfully.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add custom pattern.",
        variant: "destructive",
      });
    }
  });

  // Delete custom pattern mutation
  const deletePatternMutation = useMutation({
    mutationFn: async (patternId: number) => {
      return await apiRequest(`/api/demographic/custom-patterns/${patternId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/demographic/custom-patterns'] });
      toast({
        title: "Pattern Deleted",
        description: "Custom pattern has been removed.",
      });
    }
  });

  const resetForm = () => {
    setNewPattern({
      category: 'Name',
      fieldName: '',
      patterns: [''],
      description: '',
      examples: ['']
    });
  };

  const addPatternField = () => {
    setNewPattern({
      ...newPattern,
      patterns: [...newPattern.patterns, '']
    });
  };

  const addExampleField = () => {
    setNewPattern({
      ...newPattern,
      examples: [...newPattern.examples, '']
    });
  };

  const updatePattern = (index: number, value: string) => {
    const updated = [...newPattern.patterns];
    updated[index] = value;
    setNewPattern({ ...newPattern, patterns: updated });
  };

  const updateExample = (index: number, value: string) => {
    const updated = [...newPattern.examples];
    updated[index] = value;
    setNewPattern({ ...newPattern, examples: updated });
  };

  const removePattern = (index: number) => {
    if (newPattern.patterns.length > 1) {
      setNewPattern({
        ...newPattern,
        patterns: newPattern.patterns.filter((_, i) => i !== index)
      });
    }
  };

  const removeExample = (index: number) => {
    if (newPattern.examples.length > 1) {
      setNewPattern({
        ...newPattern,
        examples: newPattern.examples.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!newPattern.fieldName.trim()) {
      toast({
        title: "Validation Error",
        description: "Field name is required.",
        variant: "destructive",
      });
      return;
    }

    const validPatterns = newPattern.patterns.filter(p => p.trim() !== '');
    if (validPatterns.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one pattern is required.",
        variant: "destructive",
      });
      return;
    }

    const validExamples = newPattern.examples.filter(e => e.trim() !== '');
    if (validExamples.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one example is required.",
        variant: "destructive",
      });
      return;
    }

    addPatternMutation.mutate({
      ...newPattern,
      patterns: validPatterns,
      examples: validExamples
    });
  };

  const categories = ['Name', 'Contact Information', 'Government IDs', 'Financial Data', 'Personal Identifiers'];
  
  const allFields: DemographicField[] = [
    ...(patternsData?.fields || []),
    ...(customPatternsData?.patterns?.map((p: any) => ({ ...p, isCustom: true })) || [])
  ];

  const filteredFields = allFields.filter(field => {
    const matchesSearch = field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const fieldsByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredFields.filter(f => f.category === category);
    return acc;
  }, {} as Record<string, DemographicField[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading demographic patterns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Demographic Scan Patterns</h2>
          <p className="text-muted-foreground mt-1">
            Manage {patternsData?.totalFields || 0} built-in patterns and {customPatternsData?.patterns?.length || 0} custom patterns
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-add-custom-pattern">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Pattern
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add Custom Demographic Pattern</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPattern.category}
                    onValueChange={(value) => setNewPattern({ ...newPattern, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Name */}
                <div>
                  <Label htmlFor="fieldName">Field Name</Label>
                  <Input
                    id="fieldName"
                    placeholder="e.g., Customer ID"
                    value={newPattern.fieldName}
                    onChange={(e) => setNewPattern({ ...newPattern, fieldName: e.target.value })}
                    data-testid="input-field-name"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this field represents..."
                    value={newPattern.description}
                    onChange={(e) => setNewPattern({ ...newPattern, description: e.target.value })}
                    rows={2}
                    data-testid="input-description"
                  />
                </div>

                {/* Patterns */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Regex Patterns</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPatternField}
                      data-testid="button-add-pattern-field"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Pattern
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newPattern.patterns.map((pattern, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="e.g., customer[_\s-]?id/i"
                          value={pattern}
                          onChange={(e) => updatePattern(index, e.target.value)}
                          className="font-mono text-sm"
                          data-testid={`input-pattern-${index}`}
                        />
                        {newPattern.patterns.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePattern(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Use JavaScript regex syntax. Case-insensitive flag (/i) is recommended.
                  </p>
                </div>

                {/* Examples */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Examples</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExampleField}
                      data-testid="button-add-example-field"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Example
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newPattern.examples.map((example, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="e.g., customerId, customer_id"
                          value={example}
                          onChange={(e) => updateExample(index, e.target.value)}
                          data-testid={`input-example-${index}`}
                        />
                        {newPattern.examples.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExample(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={addPatternMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                    data-testid="button-save-pattern"
                  >
                    {addPatternMutation.isPending ? 'Saving...' : 'Save Pattern'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search patterns by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-patterns"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patterns Display */}
      <Accordion type="multiple" className="space-y-4" defaultValue={categories}>
        {categories.map(category => {
          const categoryFields = fieldsByCategory[category];
          if (categoryFields.length === 0) return null;

          return (
            <AccordionItem key={category} value={category} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{category}</h3>
                    <Badge variant="secondary">{categoryFields.length} patterns</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {categoryFields.map((field, idx) => (
                    <Card key={idx} className={field.isCustom ? "border-orange-200 dark:border-orange-800" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{field.fieldName}</h4>
                              {field.isCustom && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{field.description}</p>
                            
                            <div className="mb-3">
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                <Code className="w-3 h-3 inline mr-1" />
                                Examples:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {field.examples.map((example, eidx) => (
                                  <code key={eidx} className="text-xs bg-muted px-2 py-1 rounded">
                                    {example}
                                  </code>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              {field.patternCount} regex pattern{field.patternCount !== 1 ? 's' : ''} configured
                            </div>
                          </div>
                          
                          {field.isCustom && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePatternMutation.mutate((field as any).id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              data-testid={`button-delete-pattern-${field.fieldName}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {filteredFields.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No patterns found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
