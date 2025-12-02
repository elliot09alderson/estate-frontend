import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg shadow-lg p-8 border border-border"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>
                Welcome to Crimson Bricks. By accessing our website and using our services, 
                you agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
              <p>
                To access certain features, you may be required to create an account. 
                You are responsible for maintaining the confidentiality of your account information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Property Listings</h2>
              <p>
                Users who post property listings must ensure that all information provided is accurate 
                and not misleading. Crimson Bricks reserves the right to remove any listing that violates our policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, and software, 
                is the property of Crimson Bricks or its content suppliers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
              <p>
                Crimson Bricks shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of our services.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
