import React from 'react';
import { useGetPropertiesQuery } from '@/store/api-new';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ApiDebug: React.FC = () => {
  const { 
    data: propertiesData, 
    error, 
    isLoading, 
    isError 
  } = useGetPropertiesQuery({ page: 1, limit: 5 });

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Connection Debug</h3>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading properties...</span>
          </div>
        )}
        
        {isError && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {JSON.stringify(error)}</span>
          </div>
        )}
        
        {propertiesData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>API Connected Successfully!</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Response Data:</h4>
              <pre className="text-sm overflow-auto max-h-60">
                {JSON.stringify(propertiesData, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {!isLoading && !isError && !propertiesData && (
          <div className="text-gray-500">No data received</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiDebug;