import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AudienceForm.css'; // Importing CSS file

const AudienceForm = () => {
  const [audienceSize, setAudienceSize] = useState(null);
  const navigate = useNavigate();

  const initialValues = {
    rules: [{ field: 'totalSpend', operator: '>', value: '' }],
    message: '',
    logicalOperator: 'AND', // Default logical operator
    scheduledAt: '' // New field for scheduling the campaign
  };

  const validationSchema = Yup.object().shape({
    rules: Yup.array().of(
      Yup.object().shape({
        field: Yup.string().required('Field is required'),
        operator: Yup.string().required('Operator is required'),
        value: Yup.string().required('Value is required')
      })
    ),
    message: Yup.string().required('Message is required'),
    logicalOperator: Yup.string()
      .required('Logical operator is required')
      .oneOf(['AND', 'OR'], 'Logical operator must be either AND or OR'),
    scheduledAt: Yup.date()
      .nullable()
      .min(new Date(), 'Scheduled time must be in the future')
      .typeError('Scheduled time must be a valid date and time')
  });

  const handleCheckAudienceSize = async (values) => {
    console.log('Checking audience size...');
    try {
      const response = await axios.post('http://localhost:5000/api/campaigns/check-audience-size', values);
      console.log('Audience size checked:', response.data.audienceSize);
      setAudienceSize(response.data.audienceSize);
    } catch (error) {
      console.error('Error checking audience size', error.response.data);
    }
  };

  // const handleSubmit = async (values, { setSubmitting }) => {
  //   console.log('Submitting campaign...');
  //   try {
  //     await axios.post('http://localhost:5000/api/campaigns/create-scheduled', values);
  //     console.log('Campaign created successfully');
  //     alert('Campaign created successfully');
  //     navigate('/home/audience');
  //   } catch (error) {
  //     console.error('Error creating audience', error.response.data);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Submitting campaign...');
    try {
      const googleId = localStorage.getItem('googleId'); // Retrieve googleId from localStorage
      if (!googleId) {
        alert('googleId not found. Please log in again.');
        return;
      }
  
      const payload = { ...values, googleId }; // Include googleId in the payload
      const response = await axios.post(
        'http://localhost:5000/api/campaigns/create-scheduled',
        payload
      );
  
      console.log('Campaign created successfully:', response.data);
      alert('Campaign created successfully');
      navigate('/home/audience');
    } catch (error) {
      console.error('Error creating audience:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  

  return (
    <div className="centered-container">
      <h1 className="heading">Create Campaign</h1>
      <div className="form-container">
        <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <FieldArray name="rules">
                  {({ insert, remove, push }) => (
                    <div className="rules-container">
                      {values.rules.length > 0 &&
                        values.rules.map((rule, index) => (
                          <div className="rule-item" key={index}>
                            <div className="rule-fields">
                              <Field name={`rules.${index}.field`} as="select" className="rule-field">
                                <option value="totalSpend">Total Spend</option>
                                <option value="numVisits">Number of Visits</option>
                                <option value="lastVisitDate">Last Visit Date</option>
                              </Field>
                              <ErrorMessage name={`rules.${index}.field`} component="div" className="error-message" />
                            </div>
                            <div className="rule-operator">
                              <Field name={`rules.${index}.operator`} as="select" className="rule-operator-select">
                                <option value=">">Greater than</option>
                                <option value=">=">Greater than or equal</option>
                                <option value="<">Less than</option>
                                <option value="<=">Less than or equal</option>
                                <option value="=">Equal to</option>
                                <option value="!=">Not equal to</option>
                              </Field>
                              <ErrorMessage name={`rules.${index}.operator`} component="div" className="error-message" />
                            </div>
                            <div className="rule-value">
                              <Field
                                name={`rules.${index}.value`}
                                type={rule.field === 'lastVisitDate' ? 'date' : 'text'}
                                className="rule-value-input"
                              />
                              <ErrorMessage name={`rules.${index}.value`} component="div" className="error-message" />
                            </div>
                            <div className="rule-remove">
                              <button
                                type="button"
                                className="remove-button"
                                onClick={() => remove(index)}
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                      <button
                        type="button"
                        className="add-rule-button"
                        onClick={() => {
                          console.log('Adding rule...');
                          push({ field: '', operator: '', value: '' });
                        }}
                      >
                        Add Rule
                      </button>
                    </div>
                  )}
                </FieldArray>

                <div className="message-field">
                  <Field name="message" type="text" placeholder="Message" className="message-input" />
                  <ErrorMessage name="message" component="div" className="error-message" />
                </div>

                <div className="logical-operator-field">
                  <Field name="logicalOperator" as="select" className="logical-operator-select">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </Field>
                  <ErrorMessage name="logicalOperator" component="div" className="error-message" />
                </div>

                {/* New Scheduled At Field for Date and Time */}
                <div className="scheduled-at-field">
                  <label htmlFor="scheduledAt">Scheduled At (Date & Time):</label>
                  <Field
                    name="scheduledAt"
                    type="datetime-local" // Allows both date and time input
                    className="scheduled-at-input"
                  />
                  <ErrorMessage name="scheduledAt" component="div" className="error-message" />
                </div>

                <div className="check-audience">
                  <button
                    type="button"
                    className="check-audience-button"
                    onClick={() => {
                      console.log('Checking audience size...');
                      handleCheckAudienceSize(values);
                    }}
                  >
                    Check Audience Size
                  </button>
                  {audienceSize !== null && <div className="audience-size">Audience Size: {audienceSize}</div>}
                </div>
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    Create Campaign
                  </button>
                
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AudienceForm;
