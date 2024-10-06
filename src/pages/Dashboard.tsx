import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import isEqual from 'lodash.isequal';
import { useAppState, useAppDispatch } from '../hooks/useReducer';
import { useLocalForage } from '../hooks/useLocalForage';
import Icon from '../components/Icon';
import { percentageFormat, currencyFormat } from '../utils/calculateHelpers';
import { getGlobalTotals } from '../utils/totals';
import { GlobalTotals, SelectedCurrency } from '../types/store';
import { Card, Spinner, Button, Tooltip } from 'flowbite-react';
import Modal from '../components/Modal';
import SelectCurrencies from '../components/SelectCurrencies';
import Page from '../components/Page';
import Charts from '../components/ChartsDashboard';
import Table from '../components/Table';
import TableRow from '../components/TableRow';

const Dashboard: React.FC = () => {
  const { fetchedCurrencies, selectedCurrencies, globalTotals } = useAppState();
  const dispatch = useAppDispatch();
  const { setLocalForage, initStore } = useLocalForage();

  const [openRemoveAssetModal, setOpenRemoveAssetModal] =
    useState<boolean>(false);
  const [currentCurrency, setCurrentCurrency] =
    useState<SelectedCurrency | null>(null);

  useEffect(() => {
    if (selectedCurrencies && fetchedCurrencies) {
      const totals: GlobalTotals = getGlobalTotals(
        selectedCurrencies,
        fetchedCurrencies
      );
      dispatch({
        type: 'SET_GLOBAL_TOTALS',
        payload: totals,
      });
    }
  }, [selectedCurrencies, fetchedCurrencies, dispatch]);

  const handleRemoveCurrency = async (selectedCurrency: SelectedCurrency) => {
    try {
      const updatedCurrencies = selectedCurrencies.filter(
        (item) => !isEqual(item, selectedCurrency)
      );
      setOpenRemoveAssetModal(false);
      setLocalForage('selectedCurrencies', updatedCurrencies);
      dispatch({
        type: 'SET_SELECTED_CURRENCIES',
        payload: updatedCurrencies,
      });
    } catch (error) {
      console.error('Error removing currency:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: true,
      });
    }
  };

  const handleOrderCurrencyUp = async (selectedCurrency: SelectedCurrency) => {
    const currIndex = selectedCurrencies.findIndex(
      (item) => item.name === selectedCurrency.name
    );
    if (currIndex > 0) {
      const updatedCurrencies = [...selectedCurrencies];
      const [element] = updatedCurrencies.splice(currIndex, 1);
      updatedCurrencies.splice(currIndex - 1, 0, element);
      try {
        setLocalForage('selectedCurrencies', updatedCurrencies);
        dispatch({
          type: 'SET_SELECTED_CURRENCIES',
          payload: updatedCurrencies,
        });
      } catch (error) {
        console.error('Error ordering currency up:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: true,
        });
      }
    }
  };

  const handleOrderCurrencyDown = async (
    selectedCurrency: SelectedCurrency
  ) => {
    const currIndex = selectedCurrencies.findIndex(
      (item) => item.name === selectedCurrency.name
    );
    if (currIndex < selectedCurrencies.length - 1 && currIndex !== -1) {
      const updatedCurrencies = [...selectedCurrencies];
      const [element] = updatedCurrencies.splice(currIndex, 1);
      updatedCurrencies.splice(currIndex + 1, 0, element);
      try {
        setLocalForage('selectedCurrencies', updatedCurrencies);
        dispatch({
          type: 'SET_SELECTED_CURRENCIES',
          payload: updatedCurrencies,
        });
      } catch (error) {
        console.error('Error ordering currency down:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: true,
        });
      }
    }
  };

  const handleOpenRemoveAssetModal = (selectedCurrency: SelectedCurrency) => {
    setCurrentCurrency(selectedCurrency);
    setOpenRemoveAssetModal(true);
  };

  return (
    <Page>
      {fetchedCurrencies && selectedCurrencies ? (
        <>
          <div className="grid gap-4 mb-4">
            <Card>
              <div className="flex flex-row items-center">
                {globalTotals && (
                  <div className="text-white">
                    <Tooltip content="Total Value">
                      <div className="text-4xl">
                        {currencyFormat(globalTotals.totalValue)}
                      </div>
                    </Tooltip>
                    <Tooltip content="( Total Costs / Total Value * 100 ) - 100">
                      <div
                        className={classNames('text-xl', {
                          'text-blue-500':
                            globalTotals.totalPercentageDifference > 0,
                          'text-red-500':
                            globalTotals.totalPercentageDifference < 0,
                        })}
                      >
                        {percentageFormat(
                          globalTotals.totalPercentageDifference
                        )}
                      </div>
                    </Tooltip>
                  </div>
                )}
                <SelectCurrencies className="flex ml-auto" />
              </div>

              <Table type="dashboard">
                {selectedCurrencies.map((selectedCurrency, index) => (
                  <TableRow
                    key={selectedCurrency.cmc_id}
                    type="dashboard"
                    item={selectedCurrency as SelectedCurrency}
                    currencies={fetchedCurrencies}
                    currentCurrency={currentCurrency}
                  >
                    {index > 0 && (
                      <Button
                        color="gray"
                        onClick={() => handleOrderCurrencyUp(selectedCurrency)}
                        className="rounded-md text-black flex"
                      >
                        <Icon id="Up" color="white" />
                      </Button>
                    )}
                    {index + 1 < selectedCurrencies.length && (
                      <Button
                        color="gray"
                        onClick={() =>
                          handleOrderCurrencyDown(selectedCurrency)
                        }
                        className="rounded-md text-black flex ml-2"
                      >
                        <Icon id="Down" color="white" />
                      </Button>
                    )}
                    <Link to={selectedCurrency.slug} className="ml-2">
                      <Button>
                        <Icon id="Plus" color="white" />
                      </Button>
                    </Link>
                    <Button
                      color="failure"
                      onClick={() =>
                        handleOpenRemoveAssetModal(selectedCurrency)
                      }
                      className="rounded-md text-black bg-red-500 ml-2"
                    >
                      <Icon id="Remove" color="white" />
                    </Button>
                  </TableRow>
                ))}
              </Table>
            </Card>
          </div>
          {selectedCurrencies.some((e) => e.assets.length > 0) && (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              <Card>
                <Charts data={selectedCurrencies} id="amount" />
              </Card>
              <Card>
                <Charts data={selectedCurrencies} id="invested" />
              </Card>
            </div>
          )}
          <Modal
            open={openRemoveAssetModal}
            title="Are you sure you want to remove this currency and its associated assets?"
            onClose={() => setOpenRemoveAssetModal(false)}
          >
            <Icon
              id="Warning"
              color="white"
              className="flex mx-auto mb-4 text-6xl"
            />
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  if (currentCurrency) {
                    handleRemoveCurrency(currentCurrency);
                  }
                }}
                color="failure"
              >
                <Icon id="Remove" color="white" className="mr-1" />
                Remove currency
              </Button>
            </div>
          </Modal>
        </>
      ) : (
        <div className="text-white flex items-center">
          <Spinner
            color="success"
            aria-label="Fetching data from Coinmarketcap"
          />
          <span className="ml-2">Fetching data from Coinmarketcap...</span>
        </div>
      )}
    </Page>
  );
};

export default Dashboard;
