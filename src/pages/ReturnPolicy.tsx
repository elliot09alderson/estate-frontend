import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ReturnPolicy = () => {
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
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Return & Refund Policy</h1>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
              <p>
                At Crimson Bricks, we strive to ensure our customers are satisfied with our services. 
                This Return & Refund Policy outlines the terms and conditions for refunds related to our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Service Cancellations</h2>
              <p>
                If you wish to cancel a paid service (such as a premium listing or featured property), 
                please contact our support team within 24 hours of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Refund Eligibility</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Refunds are processed for services not yet rendered or activated.</li>
                <li>Technical errors resulting in double charges will be refunded immediately.</li>
                <li>Services that have already been fully delivered (e.g., a listing that has run its course) are non-refundable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Processing Time</h2>
              <p>
                Approved refunds will be processed within 5-7 business days and credited back to the original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
              <p>
                If you have any questions about our Return & Refund Policy, please contact us at:
                <br />
                Email: info@crimsonbricks.com
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
