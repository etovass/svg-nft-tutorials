"use client";

import { useEffect, useState } from 'react';
import { CUSTOM_NETWORK_ID, NETWORKS, readContract } from './common/read-contract';
import { BaseError } from 'viem';
import { Content, ContentType, ParsedOutput, parseContractFunctionOutput } from './common/parser';
import { colorJsonHtml } from './common/color-json';
import { Base64 } from 'js-base64';
import { useDefaultOrSearchParam, ParamsMap, encodeParams } from './common/search-param-hook';
import { useSearchParams } from 'next/navigation';
import { Tooltip } from 'react-tooltip';
import useKeypress from 'react-use-keypress';

async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
}

function colorJson(json: any) {
    return colorJsonHtml(JSON.stringify(json, null, 2))
}

export default function Home() {
    const paramsMap: ParamsMap = new Map();
    const searchParams = useSearchParams();

    const PAGE_WIDTH = "w-[600px]";

    const [pageOpacity, setPageOpacity] = useState(1);

    const [isHidden, setIsHidden] = useState(false);
    
    const [address, setAddress] = useDefaultOrSearchParam("0xb44298c4ef2f474a25a570ce23ece36ecfcd45d3", "address", paramsMap, searchParams);
    const [networkId, setNetworkId] = useDefaultOrSearchParam(NETWORKS[0].id, "network", paramsMap, searchParams);
    const [functionName, setFunctionName] = useDefaultOrSearchParam("tokenURI", "function", paramsMap, searchParams);
    const [tokenIdType, setTokenIdType] = useDefaultOrSearchParam("uint256", "tokenIdType", paramsMap, searchParams); 
    const [customNodeUrl, setCustomNodeUrl] = useDefaultOrSearchParam("", "customNodeUrl", paramsMap, searchParams); 
    const [viewWidth, setViewWidth] = useDefaultOrSearchParam(255, "viewWidth", paramsMap, searchParams); 

    const [tokenId, setTokenId] = useDefaultOrSearchParam(28, "tokenId", paramsMap, searchParams); 
    const [responsive, setResponsive] = useDefaultOrSearchParam(false, "responsive", paramsMap, searchParams); 
    const [showBorder, setShowBorder] = useDefaultOrSearchParam(true, "showBorder", paramsMap, searchParams); 
    const [content, setContent] = useState(null as unknown as ParsedOutput);

    const [error, setError] = useState("");

    const handleAddressChange = (e: any) => setAddress(e.target.value);
    const handleFunctionNameChange = (e: any) => setFunctionName(e.target.value);
    const handleTokenIdTypeChange = (e: any) => setTokenIdType(e.target.value);

    const handleNextId = async (e: any) => {
        let savedTokenId = tokenId;
        setTokenId(savedTokenId + 1);

        await invokeContractFunction(savedTokenId + 1);
    }
    
    const handlePrevId = async (e: any) => {
        let savedTokenId = tokenId;
        if (savedTokenId > 0) { 
            setTokenId(savedTokenId - 1);

            await invokeContractFunction(savedTokenId - 1);
        }
    }

    const handleTokenIdChange = (e: any) => setTokenId(parseInt(e.target.value));
    const handleCustomNodeUrlChange = (e: any) => setCustomNodeUrl(e.target.value);
    const handleNetworkChange = (e: any) => setNetworkId(e.target.value);
    const handleViewWidthChange = (e: any) => setViewWidth(e.target.value);
    const handleShowBorderChange = (e: any) => setShowBorder(e.target.checked);
    const handleResponsiveChange = (e: any) => setResponsive(e.target.checked);
    
    const handleCopyLink = async (e: any) => {
    
        let searchParams = encodeParams(paramsMap);
        let url = window.location.protocol + "//" + window.location.host + "/?" + searchParams;

        await copyToClipboard(url);
    }

    const renderContent = (c: Content) => {
        if (c.contentType == ContentType.HTML) {
            return <iframe style={{width:"100%", aspectRatio:"1 / 1"}} srcDoc={c.content}/>
        } 

        if (c.contentType == ContentType.SVG) {
            return <img src={c.content} alt=''></img>
        }

        // wrap PNG and JPG to img
        return <img src={c.content}></img>
    }

    const invokeContractFunction  = async (myTokenId: number) => {
        setError("");
        setPageOpacity(0.25);

        try {
            let result = await readContract(networkId, address, functionName, myTokenId, tokenIdType, customNodeUrl);
            let parsed = parseContractFunctionOutput(result as string);
            
            setContent(parsed);
        } catch (error: any) {
            let message;

            console.log(JSON.stringify(error, null, 2));

            if (error instanceof BaseError) {
                message = error.message || error.shortMessage;
            }
            
            if (message) {
                setError(message);
            } else {
                setError(error.stack || error);
            }
        }

        setPageOpacity(1);
    }

    const handleApplyButton = async (e: any) => {
        await invokeContractFunction(tokenId);
    }

    useEffect(() => {
        invokeContractFunction(tokenId);
    }, [])

    useKeypress("Enter", handleApplyButton);
    useKeypress(["]", "."], handleNextId);
    useKeypress(["[", ","], handlePrevId);

    return (
      <main className="font-mono text-sm text-black whitespace-nowrap" style={{opacity: pageOpacity}}>      
          { isHidden && 
              <div className={"text-xs " + (responsive ? "w-full" : PAGE_WIDTH)}>
                  <div className="mt-2 flex justify-center items-center text-gray-500">
                      <button className="bg-gray-300 hover:bg-gray-400 px-1 py-1 rounded" onClick={() => setIsHidden(false)}>
                          <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
                      </button>
                  </div>
              </div>
          }

          { !isHidden && <div className={"text-xs " + (responsive ? "w-full" : PAGE_WIDTH)}>
              <div className="mx-4 mt-1 px-2 py-2 flex flex-col border-2">
                  <div className="flex flex-row items-center">
                      <span>address</span>
                      <input className="ml-2 w-full border-2 rounded" value={address} onChange={handleAddressChange}/>
                  </div>

                  <div className="mt-1 flex flex-row items-center">
                      <span>network</span>
                      <select className="mx-2 border-2 rounded" value={networkId} onChange={handleNetworkChange}>
                          { NETWORKS.map((n,ind) => (
                                <option key={n.id} value={n.id}>
                                    {n.label}
                                </option>
                            ))
                          }
                      </select>
                  </div>

                  { (networkId == CUSTOM_NETWORK_ID) && <div className="mt-1 flex flex-row items-center">
                      <span>node url</span>
                      <input className="ml-2 w-full border-2 rounded" value={customNodeUrl} onChange={handleCustomNodeUrlChange}/>
                  </div>
                  }

                  <div className="mt-1 flex flex-row justify-between"> 
                      <div className="flex flex-row items-center">
                          <span>function</span>
                          <input className="ml-2 border-2 rounded w-24" value={functionName} onChange={handleFunctionNameChange}/>
                      </div>
                      <div className="ml-4 flex flex-row items-center">
                          <span>tokenId type</span>
                          <input className="ml-2 border-2 rounded w-16" value={tokenIdType} onChange={handleTokenIdTypeChange}/>
                      </div>
                  </div>

                  <div className="mt-2 flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center jutify-start">
                            <input className="self-start" type="range" min="128" max="1024" value={viewWidth} onChange={handleViewWidthChange} />
                            <span className="ml-4 text-xs">{viewWidth}x{viewWidth} px</span>
                        </div>

                        <div className="flex flex-row items-center jutift-end">
                            <button className="ml-3 fill-blue-500 hover:fill-blue-700 py-1 px-1" onClick={handleCopyLink}>
                                <a  
                                    data-tooltip-id="my-tooltip" 
                                    data-tooltip-content="Link copied to clipboard"
                                    data-tooltip-variant="info"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 640 512"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>
                                </a>
                                <Tooltip id="my-tooltip" style={{fontSize: 16}} openEvents={{click: true}} delayHide={400}/>
                            </button>

                            <button className="ml-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded" onClick={() => setIsHidden(true)}>
                                Hide
                            </button>

                            <button className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={(e) => handleApplyButton(e)}>
                                Apply
                            </button>
                        </div>                                
                  </div>
              </div>
          </div>}


          <div className={ responsive ? "w-full" : PAGE_WIDTH}>
              <div className="mx-4 mt-4 justify-between items-center flex flex-row">
                  <div className="flex flex-row items-center">
                      <span>show border</span>
                      <input className="ml-2" type="checkbox" id="showBorder" checked={showBorder} onChange={handleShowBorderChange}/>
                  </div>
                  <div className="flex flex-row items-center">
                      <span>responsive</span>
                      <input className="ml-2" type="checkbox" id="responsive" checked={responsive} onChange={handleResponsiveChange}/>
                  </div>

                  <div className="flex flex-row items-center">
                      <span>tokenId</span>
                      <button id="decr" className="px-2" onClick={handlePrevId}>
                          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                      </button>
                      <input className="w-16 text-right border-2" type="number" id="tokenId" name="tokenId" min="0" value={tokenId} onChange={handleTokenIdChange} />
                      <button id="incr" className="pl-2" onClick={handleNextId}>
                          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                      </button>
                  </div>
              </div>

              { error && error.length > 0 && <div className="m-4 flex flex-row ">
                  <pre className="text-red-500 font-bold">{error}</pre>
              </div>
              }

              { (!error || error.length == 0) && <div className={"m-4 flex " + (responsive ? "flex-col" : "flex-row")}>
                  { (content && content.content) && 
                    <div className="flex flex-col">
                        {content.content.map( (c, ind) => (
                            <div key={ind}>
                                { (c.label) && 
                                    <span className="italic text-xs font-bold">
                                        {c.label}
                                    </span>
                                }
                              
                                <div className={"border-dashed border-red-500 border-2 " + (showBorder ? "border-opacity-100" : "border-opacity-0")} style={{minWidth: responsive ? "100%" : viewWidth + "px"}}>
                                    {renderContent(c)}
                                </div>
                            </div>
                        ))
                        }
                    </div>
                  }

                { (content && content.json) && 
                    <div className={responsive ? "mt-4" : "ml-4 mt-5"}>
                        <div className="text-xs">
                            <span className={(responsive ? "whitespace-pre-wrap" : "whitespace-pre")}>
                                <div className="border-[1px]" dangerouslySetInnerHTML={{__html: colorJson(content.json)}}/>
                            </span>
                        </div>
                    </div>
                }
              </div>
              }
          </div>
      </main>
    )
}
